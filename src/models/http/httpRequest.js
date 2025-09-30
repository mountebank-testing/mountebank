'use strict';

const queryString = require('querystring'),
    zlib = require('zlib'),
    helpers = require('../../util/helpers.js'),
    headersMapModule = require('./headersMap.js');


/**
 * Transforms a node http/s request to a simplified mountebank http/s request
 * that will be shown in the API
 * @module
 */

function transform (request) {
    const url = new URL(request.url, 'http://localhost'),
        search = url.search === '' ? '' : url.search.substr(1),
        headersMap = headersMapModule.ofRaw(request.rawHeaders),
        transformed = {
            requestFrom: helpers.socketName(request.socket),
            method: request.method,
            path: url.pathname,
            query: queryString.parse(search),
            headers: headersMap.all(),
            body: request.body,
            bodyEncoding: request.bodyEncoding,
            ip: request.socket.remoteAddress
        },
        contentType = headersMap.get('Content-Type');

    if (request.body && isUrlEncodedForm(contentType)) {
        transformed.form = queryString.parse(request.body);
    }

    return transformed;
}

function isUrlEncodedForm (contentType) {
    if (!contentType) {
        return false;
    }

    const index = contentType.indexOf(';'),
        type = index !== -1 ? contentType.substr(0, index).trim() : contentType.trim();

    return type === 'application/x-www-form-urlencoded';
}

/**
 * Creates the API-friendly http/s request
 * @param {Object} request - The raw http/s request
 * @returns {Object} - Promise resolving to the simplified request
 */
function createFrom (request) {
    /* eslint-disable quote-props */
    const HTTPCHARSET_TO_BUFFERCHARSET = {
        'utf8': 'utf8',
        'utf-8': 'utf8',
        'iso88591': 'latin1',
        'iso-8859-1': 'latin1',
        '8859-1': 'latin1',
        'iso-latin-1': 'latin1',
        'latin-1': 'latin1',
        'latin1': 'latin1',
        'UTF8': 'utf8',
        'UTF-8': 'utf8',
        'ISO88591': 'latin1',
        'ISO-8859-1': 'latin1',
        'ISO-LATIN-1': 'latin1',
        'LATIN-1': 'latin1',
        'LATIN1': 'latin1'
    };
    /* eslint-enable quote-props */

    function guessEncoding (contentType = '') {
        const [type, charset] = contentType.match(/^([^;]*)(?:.*?charset=([^;]+))?/).slice(1, 4);
        if (charset) {
            return HTTPCHARSET_TO_BUFFERCHARSET[charset];
        }
        else if (type === 'application/x-www-form-urlencoded') {
            return 'utf8';
        }
        else if (type.match(/json/)) {
            return 'utf8';
        }
        else if (type.match(/^text\//)) {
            return 'latin1';
        }
        return false;
    }

    return new Promise(resolve => {
        const chunks = [];
        request.on('data', chunk => { chunks.push(Buffer.from(chunk)); });
        request.on('end', () => {
            const headersMap = headersMapModule.ofRaw(request.rawHeaders),
                contentEncoding = headersMap.get('Content-Encoding'),
                contentType = headersMap.get('Content-Type'),
                buffer = Buffer.concat(chunks);
            let decodedBuffer;
            if (contentEncoding === 'gzip') {
                try {
                    decodedBuffer = zlib.gunzipSync(buffer);
                }
                catch (error) { /* do nothing */ }
            }
            else if (contentEncoding === 'br') {
                try {
                    decodedBuffer = zlib.brotliDecompressSync(buffer);
                }
                catch (error) { /* do nothing */ }
            }
            else {
                decodedBuffer = buffer;
            }
            request.bodyEncoding = guessEncoding(contentType);
            // TODO: check if decodedBuffer matches encoding (latin1), if not resort to binary.
            // TODO: support more text encodings, i.e. use iconv
            request.body = decodedBuffer.toString(request.bodyEncoding || 'base64');
            resolve(transform(request));
        });
    });
}

module.exports = { createFrom };
