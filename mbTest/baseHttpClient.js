'use strict';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function create (protocol) {
    const driver = require(protocol);

    function optionsFor (spec) {
        if (!spec.hostname) {
            spec.hostname = 'localhost';
        }
        if (!spec.headers) {
            spec.headers = {};
        }
        if (!Object.keys(spec.headers).some(key => key.toLowerCase() === 'accept')) {
            spec.headers.accept = 'application/json';
        }
        if (!('responseEncoding' in spec)) {
            spec.responseEncoding = 'utf8';
        }
        if (!('requestEncoding' in spec)) {
            spec.requestEncoding = 'utf8';
        }
        spec.rejectUnauthorized = false;
        return spec;
    }

    async function responseFor (spec) {
        const options = optionsFor(spec);

        if (!spec.agent && !spec.createConnection) {
            options.agent = new driver.Agent({ keepAlive: true });
        }

        if (!options.port) {
            throw Error('silly rabbit, you forgot to pass the port again');
        }

        if (spec.body && !options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }

        return new Promise((resolve, reject) => {
            const request = driver.request(options, response => {
                const packets = [];

                response.on('data', chunk => packets.push(chunk));

                response.on('end', () => {
                    const buffer = Buffer.concat(packets),
                        contentType = response.headers['content-type'] || '';

                    response.body = spec.responseEncoding ? buffer.toString(spec.responseEncoding) : buffer;

                    if (contentType.indexOf('application/json') === 0 && spec.responseEncoding === 'utf8') {
                        response.body = JSON.parse(response.body);
                    }
                    resolve(response);
                });
            });

            request.on('error', reject);

            if (spec.body) {
                if (spec.headers['Content-Type'] === 'application/json' && spec.requestEncoding === 'utf8' && typeof spec.body === 'object') {
                    request.write(JSON.stringify(spec.body));
                }
                else {
                    // This covers both the Buffer situation and the non-utf8 string encoding.
                    request.write(spec.body, spec.requestEncoding);
                }
            }
            request.end();
        });
    }

    function get (path, port, headers) { return responseFor({ method: 'GET', path, port, headers }); }
    function post (path, body, port, headers) { return responseFor({ method: 'POST', path, port, body, headers }); }
    function del (path, port, headers) { return responseFor({ method: 'DELETE', path, port, headers }); }
    function put (path, body, port, headers) { return responseFor({ method: 'PUT', path, port, body, headers }); }

    return { get, post, del, put, responseFor };
}

module.exports = { create };
