'use strict';

const stringify = require('safe-stable-stringify'),
    buffer = require('buffer'),
    safeRegex = require('safe-regex'),
    jsonpath = require('./jsonpath.js'),
    helpers = require('../util/helpers.js'),
    xPath = require('./xpath.js'),
    combinators = require('../util/combinators.js'),
    errors = require('../util/errors.js'),
    compatibility = require('./compatibility.js');

/**
 * All the predicates that determine whether a stub matches a request
 * @module
 */

function sortObjects (a, b) {
    const isObject = helpers.isObject;

    if (isObject(a) && isObject(b)) {
        // Make best effort at sorting arrays of objects to make
        // deepEquals order-independent
        return sortObjects(stringify(a), stringify(b));
    }
    else if (a < b) {
        return -1;
    }
    else {
        return 1;
    }
}

function forceStrings (value) {
    const isObject = helpers.isObject;

    if (value === null) {
        return 'null';
    }
    else if (Array.isArray(value)) {
        return value.map(forceStrings);
    }
    else if (isObject(value) && !Buffer.isBuffer(value)) {
        return Object.keys(value).reduce((accumulator, key) => {
            accumulator[key] = forceStrings(value[key]);
            return accumulator;
        }, {});
    }
    else if (typeof value.toString === 'function') {
        return value.toString();
    }
    else {
        return value;
    }
}

function select (type, selectFn) {
    const nodeValues = selectFn();

    // Return either a string if one match or array if multiple
    // This matches the behavior of node's handling of query parameters,
    // which allows us to maintain the same semantics between deepEquals
    // (all have to match, passing in an array if necessary) and the other
    // predicates (any can match)
    if (nodeValues && nodeValues.length === 1) {
        return nodeValues[0];
    }
    else {
        return nodeValues;
    }
}

function orderIndependent (possibleArray) {
    if (Array.isArray(possibleArray)) {
        return possibleArray.sort(sortObjects);
    }
    else {
        return possibleArray;
    }
}

function transformObject (obj, transform) {
    Object.keys(obj).forEach(key => {
        obj[key] = transform(obj[key]);
    });
    return obj;
}

function selectXPath (config, text) {
    const selectFn = combinators.curry(xPath.select, config.selector, config.ns, text);

    return orderIndependent(select('xpath', selectFn));
}

function selectTransform (config, options, logger) {
    const cloned = helpers.clone(config);

    if (config.jsonpath) {
        const stringTransform = options.shouldForceStrings ? forceStrings : combinators.identity;

        // use keyCaseSensitive instead of caseSensitive to help "matches" predicates too
        // see https://github.com/mountebank-testing/mountebank/issues/361
        if (!cloned.keyCaseSensitive) {
            cloned.jsonpath.selector = cloned.jsonpath.selector.toLowerCase();
        }

        return combinators.curry(selectJSONPath, cloned.jsonpath, config, stringTransform, logger);
    }
    else if (config.xpath) {
        if (!cloned.caseSensitive) {
            cloned.xpath.ns = transformObject(cloned.xpath.ns || {}, lowercase);
            cloned.xpath.selector = cloned.xpath.selector.toLowerCase();
        }
        return combinators.curry(selectXPath, cloned.xpath);
    }
    else {
        return combinators.identity;
    }
}

function lowercase (text) {
    return text.toLowerCase();
}

function caseTransform (config) {
    return config.caseSensitive ? combinators.identity : lowercase;
}

function exceptTransform (config, logger) {
    const exceptRegexOptions = config.caseSensitive ? 'g' : 'gi';

    if (config.except) {
        if (!safeRegex(config.except)) {
            logger.warn(`If mountebank becomes unresponsive, it is because of this unsafe regular expression: ${config.except}`);
        }
        return text => text.replace(new RegExp(config.except, exceptRegexOptions), '');
    }
    else {
        return combinators.identity;
    }
}

function tryJSON (value, predicateConfig, logger) {
    try {
        const keyCaseTransform = predicateConfig.keyCaseSensitive === false ? lowercase : caseTransform(predicateConfig),
            valueTransforms = [exceptTransform(predicateConfig, logger), caseTransform(predicateConfig)];

        // We can't call normalize because we want to avoid the array sort transform,
        // which will mess up indexed selectors like $..title[1]
        return transformAll(JSON.parse(value), [keyCaseTransform], valueTransforms, []);
    }
    catch (e) {
        return value;
    }
}

// eslint-disable-next-line max-params
function selectJSONPath (config, predicateConfig, stringTransform, logger, text) {
    const possibleJSON = stringTransform(tryJSON(text, predicateConfig, logger)),
        selectFn = combinators.curry(jsonpath.select, config.selector, possibleJSON);

    return orderIndependent(select('jsonpath', selectFn));
}

function transformAll (obj, keyTransforms, valueTransforms, arrayTransforms) {
    const apply = fns => combinators.compose.apply(null, fns),
        isObject = helpers.isObject;

    if (Array.isArray(obj)) {
        return apply(arrayTransforms)(obj.map(element => transformAll(element, keyTransforms, valueTransforms, arrayTransforms)));
    }
    else if (isObject(obj) && !Buffer.isBuffer(obj)) {
        return Object.keys(obj).reduce((accumulator, key) => {
            accumulator[apply(keyTransforms)(key)] = transformAll(obj[key], keyTransforms, valueTransforms, arrayTransforms);
            return accumulator;
        }, {});
    }
    else if (typeof obj === 'string') {
        return apply(valueTransforms)(obj);
    }
    else {
        return obj;
    }
}

function normalize (obj, config, options, logger) {
    // Needed to solve a tricky case conversion for "matches" predicates with jsonpath/xpath parameters
    if (typeof config.keyCaseSensitive === 'undefined') {
        config.keyCaseSensitive = config.caseSensitive;
    }

    const keyCaseTransform = config.keyCaseSensitive === false ? lowercase : caseTransform(config),
        sortTransform = array => array.sort(sortObjects),
        transforms = [];

    if (options.withSelectors) {
        transforms.push(selectTransform(config, options, logger));
    }

    transforms.push(exceptTransform(config, logger));
    transforms.push(caseTransform(config));

    obj = helpers.clone(obj);
    if (options.binaryBody) {
        if (obj.bodyEncoding) {
            obj.body = Buffer.from(buffer.transcode(Buffer.from(obj.body), 'utf8', obj.bodyEncoding));
        }
        else {
            obj.body = Buffer.from(obj.body, 'base64');
        }
    }
    delete obj.bodyEncoding;

    // sort to provide deterministic comparison for deepEquals,
    // where the order in the array for multi-valued querystring keys
    // and xpath selections isn't important
    return transformAll(obj, [keyCaseTransform], transforms, [sortTransform]);
}

function testPredicate (expected, actual, predicateConfig, predicateFn) {
    if (!helpers.defined(actual)) {
        actual = '';
    }
    if (helpers.isObject(expected)) {
        return predicateSatisfied(expected, actual, predicateConfig, predicateFn);
    }
    else {
        return predicateFn(expected, actual);
    }
}

function bothArrays (expected, actual) {
    return Array.isArray(actual) && Array.isArray(expected);
}

function allExpectedArrayValuesMatchActualArray (expectedArray, actualArray, predicateConfig, predicateFn) {
    return expectedArray.every(expectedValue =>
        actualArray.some(actualValue => testPredicate(expectedValue, actualValue, predicateConfig, predicateFn)));
}

function onlyActualIsArray (expected, actual) {
    return Array.isArray(actual) && !Array.isArray(expected);
}

function expectedMatchesAtLeastOneValueInActualArray (expected, actualArray, predicateConfig, predicateFn) {
    return actualArray.some(actual => testPredicate(expected, actual, predicateConfig, predicateFn));
}

function expectedLeftOffArraySyntaxButActualIsArrayOfObjects (expected, actual, fieldName) {
    return !Array.isArray(expected[fieldName]) && !helpers.defined(actual[fieldName]) && Array.isArray(actual);
}

function predicateSatisfied (expected, actual, predicateConfig, predicateFn) {
    if (!actual) {
        return false;
    }

    // Support predicates that reach into fields encoded in JSON strings (e.g. HTTP bodies)
    if (typeof actual === 'string') {
        actual = tryJSON(actual, predicateConfig);
    }

    return Object.keys(expected).every(fieldName => {
        const isObject = helpers.isObject;

        if (bothArrays(expected[fieldName], actual[fieldName])) {
            return allExpectedArrayValuesMatchActualArray(
                expected[fieldName], actual[fieldName], predicateConfig, predicateFn);
        }
        else if (onlyActualIsArray(expected[fieldName], actual[fieldName])) {
            if (predicateConfig.exists && expected[fieldName]) {
                return true;
            }
            else {
                return expectedMatchesAtLeastOneValueInActualArray(
                    expected[fieldName], actual[fieldName], predicateConfig, predicateFn);
            }
        }
        else if (expectedLeftOffArraySyntaxButActualIsArrayOfObjects(expected, actual, fieldName)) {
            // This is a little confusing, but predated the ability for users to specify an
            // array for the expected values and is left for backwards compatibility.
            // The predicate might be:
            //     { equals: { examples: { key: 'third' } } }
            // and the request might be
            //     { examples: '[{ "key": "first" }, { "different": true }, { "key": "third" }]' }
            // We expect that the "key" field in the predicate definition matches any object key
            // in the actual array
            return expectedMatchesAtLeastOneValueInActualArray(expected, actual, predicateConfig, predicateFn);
        }
        else if (Buffer.isBuffer(expected[fieldName])) {
            return predicateFn(expected[fieldName], actual[fieldName]);
        }
        else if (isObject(expected[fieldName])) {
            return predicateSatisfied(expected[fieldName], actual[fieldName], predicateConfig, predicateFn);
        }
        else {
            return testPredicate(expected[fieldName], actual[fieldName], predicateConfig, predicateFn);
        }
    });
}

function create (operator, predicateFn) {
    return (predicate, request, logger) => {
        const binaryBody = typeof predicate[operator].body === 'string' && typeof request.body === 'string'
                && (!predicate[operator].bodyEncoding || !request.bodyEncoding),
            expected = normalize(predicate[operator], predicate, { binaryBody }, logger),
            actual = normalize(request, predicate, { binaryBody, withSelectors: true }, logger);

        return predicateSatisfied(expected, actual, predicate, predicateFn);
    };
}

function deepEquals (predicate, request, logger) {
    const expected = normalize(forceStrings(predicate.deepEquals), predicate, { }, logger),
        actual = normalize(forceStrings(request), predicate, { withSelectors: true, shouldForceStrings: true }, logger),
        isObject = helpers.isObject;

    if (Buffer.isBuffer(predicate.deepEquals.body)) {
        throw errors.ValidationError('The deepEquals does not make sense in binary body');
    }

    return Object.keys(expected).every(fieldName => {
        // Support predicates that reach into fields encoded in JSON strings (e.g. HTTP bodies)
        if (isObject(expected[fieldName]) && typeof actual[fieldName] === 'string') {
            const possibleJSON = tryJSON(actual[fieldName], predicate);
            actual[fieldName] = normalize(forceStrings(possibleJSON), predicate, { }, logger);
        }
        return stringify(expected[fieldName]) === stringify(actual[fieldName]);
    });
}

function matches (predicate, request, logger) {
    // We want to avoid the lowerCase transform on values so we don't accidentally butcher
    // a regular expression with upper case metacharacters like \W and \S
    // However, we need to maintain the case transform for keys like http header names (issue #169)
    // eslint-disable-next-line no-unneeded-ternary
    const caseSensitive = predicate.caseSensitive ? true : false, // convert to boolean even if undefined
        clone = helpers.merge(predicate, { caseSensitive: true, keyCaseSensitive: caseSensitive }),
        noexcept = helpers.merge(clone, { except: '' }),
        expected = normalize(predicate.matches, noexcept, { }, logger),
        actual = normalize(request, clone, { withSelectors: true }, logger),
        options = caseSensitive ? '' : 'i';

    if (predicate.matches.body && typeof predicate.matches.body === 'string' && !predicate.matches.bodyEncoding) {
        throw errors.ValidationError('the matches predicate is not allowed for binary bodies');
    }

    return predicateSatisfied(expected, actual, clone, (a, b) => {
        if (!safeRegex(a)) {
            logger.warn(`If mountebank becomes unresponsive, it is because of this unsafe regular expression: ${a}`);
        }
        return new RegExp(a, options).test(b);
    });
}

function not (predicate, request, logger, imposterState) {
    return !evaluate(predicate.not, request, logger, imposterState);
}

function evaluateFn (request, logger, imposterState) {
    return subPredicate => evaluate(subPredicate, request, logger, imposterState);
}

function or (predicate, request, logger, imposterState) {
    return predicate.or.some(evaluateFn(request, logger, imposterState));
}

function and (predicate, request, logger, imposterState) {
    return predicate.and.every(evaluateFn(request, logger, imposterState));
}

function inject (predicate, request, logger, imposterState) {
    if (request.isDryRun === true) {
        return true;
    }

    const config = {
        request: helpers.clone(request),
        state: imposterState,
        logger: logger
    };

    compatibility.downcastInjectionConfig(config);

    const injected = `(${predicate.inject})(config, logger, imposterState);`;

    try {
        return eval(injected);
    }
    catch (error) {
        logger.error(`injection X=> ${error}`);
        logger.error(`    source: ${JSON.stringify(injected)}`);
        logger.error(`    config.request: ${JSON.stringify(config.request)}`);
        logger.error(`    config.state: ${JSON.stringify(config.state)}`);
        throw errors.InjectionError('invalid predicate injection', { source: injected, data: error.message });
    }
}

function toString (value) {
    if (value !== null && typeof value !== 'undefined' && typeof value.toString === 'function') {
        return value.toString();
    }
    else {
        return value;
    }
}

const predicates = {
    equals: create('equals', (expected, actual) => (Buffer.isBuffer(expected) ? expected.equals(actual) : toString(expected) === toString(actual))),
    deepEquals,
    contains: create('contains', (expected, actual) => actual.indexOf(expected) >= 0),
    startsWith: create('startsWith', (expected, actual) => actual.indexOf(expected) === 0),
    endsWith: create('endsWith', (expected, actual) => actual.indexOf(expected, actual.length - expected.length) >= 0),
    matches,
    exists: create('exists', function (expected, actual) {
        return expected ? (typeof actual !== 'undefined' && actual !== '') : (typeof actual === 'undefined' || actual === '');
    }),
    not,
    or,
    and,
    inject
};

/**
 * Resolves all predicate keys in given predicate
 * @param {Object} predicate - The predicate configuration
 * @param {Object} request - The protocol request object
 * @param {Object} logger - The logger, useful for debugging purposes
 * @param {Object} imposterState - The current state for the imposter
 * @returns {boolean}
 */
function evaluate (predicate, request, logger, imposterState) {
    const predicateFn = Object.keys(predicate).find(key => Object.keys(predicates).indexOf(key) >= 0),
        clone = helpers.clone(predicate);

    if (predicateFn) {
        return predicates[predicateFn](clone, request, logger, imposterState);
    }
    else {
        throw errors.ValidationError('missing predicate', { source: predicate });
    }
}

module.exports = { evaluate };
