# npm audit Vulnerability Report

This report summarizes the vulnerabilities found in the codebase. The vulnerabilities are listed in order of severity, from critical to low.

## Critical

*   **ejs**:
    *   Description: template injection vulnerability, lacks certain pollution protection
    *   URL: [https://github.com/advisories/GHSA-phwq-j96m-2c2q](https://github.com/advisories/GHSA-phwq-j96m-2c2q), [https://github.com/advisories/GHSA-ghr5-ch3p-vcr6](https://github.com/advisories/GHSA-ghr5-ch3p-vcr6)
    *   Fix: No fix available

*   **form-data**:
    *   Description: uses unsafe random function in form-data for choosing boundary
    *   URL: [https://github.com/advisories/GHSA-fjxv-7rqg-78g4](https://github.com/advisories/GHSA-fjxv-7rqg-78g4)
    *   Fix: No fix available

*   **https-proxy-agent**:
    *   Description: Denial of Service in https-proxy-agent, Machine-In-The-Middle in https-proxy-agent
    *   URL: [https://github.com/advisories/GHSA-8g7p-74h8-hg48](https://github.com/advisories/GHSA-8g7p-74h8-hg48), [https://github.com/advisories/GHSA-pc5p-h8pf-mvwp](https://github.com/advisories/GHSA-pc5p-h8pf-mvwp)
    *   Fix: `npm audit fix --force`

*   **jsonpath-plus**:
    *   Description: JSONPath Plus Remote Code Execution (RCE) Vulnerability, JSONPath Plus allows Remote Code Execution
    *   URL: [https://github.com/advisories/GHSA-pppg-cpfq-h7wr](https://github.com/advisories/GHSA-pppg-cpfq-h7wr), [https://github.com/advisories/GHSA-hw8r-x6gr-5gjp](https://github.com/advisories/GHSA-hw8r-x6gr-5gjp)
    *   Fix: `npm audit fix --force`

*   **netmask**:
    *   Description: Improper parsing of octal bytes in netmask, netmask npm package mishandles octal input data
    *   URL: [https://github.com/advisories/GHSA-4c7m-wxvm-r7gc](https://github.com/advisories/GHSA-4c7m-wxvm-r7gc), [https://github.com/advisories/GHSA-pch5-whg9-qr2r](https://github.com/advisories/GHSA-pch5-whg9-qr2r)
    *   Fix: `npm audit fix --force`

*   **protobufjs**:
    *   Description: protobufjs Prototype Pollution vulnerability
    *   URL: [https://github.com/advisories/GHSA-h755-8qp9-cq85](https://github.com/advisories/GHSA-h755-8qp9-cq85)
    *   Fix: `npm audit fix`

## High

*   **body-parser**:
    *   Description: body-parser vulnerable to denial of service when url encoding is enabled
    *   URL: [https://github.com/advisories/GHSA-qwcr-r2fm-qrc7](https://github.com/advisories/GHSA-qwcr-r2fm-qrc7)
    *   Fix: `npm audit fix --force`

*   **cross-spawn**:
    *   Description: Regular Expression Denial of Service (ReDoS) in cross-spawn
    *   URL: [https://github.com/advisories/GHSA-3xgq-45jj-v275](https://github.com/advisories/GHSA-3xgq-45jj-v275)
    *   Fix: `npm audit fix --force`

*   **debug**:
    *   Description: debug Inefficient Regular Expression Complexity vulnerability, Regular Expression Denial of Service in debug
    *   URL: [https://github.com/advisories/GHSA-9vvw-cc9w-f27h](https://github.com/advisories/GHSA-9vvw-cc9w-f27h), [https://github.com/advisories/GHSA-gxpj-cx7g-858c](https://github.com/advisories/GHSA-gxpj-cx7g-858c)
    *   Fix: `npm audit fix --force`

*   **degenerator**:
    *   Description: Code Injection in pac-resolver
    *   URL: [https://github.com/advisories/GHSA-9j49-mfvp-vmhm](https://github.com/advisories/GHSA-9j49-mfvp-vmhm)
    *   Fix: `npm audit fix --force`

*   **http-proxy-agent**:
    *   Description: Resource Exhaustion Denial of Service in http-proxy-agent, Denial of Service in http-proxy-agent
    *   URL: [https://github.com/advisories/GHSA-86wf-436m-h424](https://github.com/advisories/GHSA-86wf-436m-h424), [https://github.com/advisories/GHSA-8w57-jfpm-945m](https://github.com/advisories/GHSA-8w57-jfpm-945m)
    *   Fix: `npm audit fix`

*   **ip**:
    *   Description: ip SSRF improper categorization in isPublic
    *   URL: [https://github.com/advisories/GHSA-2p57-rm9w-gvfp](https://github.com/advisories/GHSA-2p57-rm9w-gvfp)
    *   Fix: `npm audit fix --force`

*   **mime**:
    *   Description: mime Regular Expression Denial of Service when MIME lookup performed on untrusted user input
    *   URL: [https://github.com/advisories/GHSA-wrvr-8mpx-r7pp](https://github.com/advisories/GHSA-wrvr-8mpx-r7pp)
    *   Fix: `npm audit fix --force`

*   **path-to-regexp**:
    *   Description: path-to-regexp outputs backtracking regular expressions, path-to-regexp contains a ReDoS
    *   URL: [https://github.com/advisories/GHSA-9wv6-86v2-598j](https://github.com/advisories/GHSA-9wv6-86v2-598j), [https://github.com/advisories/GHSA-rhx6-c78j-4q9w](https://github.com/advisories/GHSA-rhx6-c78j-4q9w)
    *   Fix: `npm audit fix --force`

*   **qs**:
    *   Description: Prototype Pollution Protection Bypass in qs, Denial-of-Service Extended Event Loop Blocking in qs, Denial-of-Service Memory Exhaustion in qs, qs vulnerable to Prototype Pollution
    *   URL: [https://github.com/advisories/GHSA-gqgv-6jq5-jjj9](https://github.com/advisories/GHSA-gqgv-6jq5-jjj9), [https://github.com/advisories/GHSA-f9cm-p3w6-xvr3](https://github.com/advisories/GHSA-f9cm-p3w6-xvr3), [https://github.com/advisories/GHSA-jjv7-qpx3-h62q](https://github.com/advisories/GHSA-jjv7-qpx3-h62q), [https://github.com/advisories/GHSA-hrpp-h998-j3pp](https://github.com/advisories/GHSA-hrpp-h998-j3pp)
    *   Fix: `npm audit fix --force`

*   **send**:
    *   Description: send vulnerable to template injection that can lead to XSS
    *   URL: [https://github.com/advisories/GHSA-m6fv-jmcg-4jfg](https://github.com/advisories/GHSA-m6fv-jmcg-4jfg)
    *   Fix: `npm audit fix --force`

## Moderate

*   **cookiejar**:
    *   Description: cookiejar Regular Expression Denial of Service via Cookie.parse function
    *   URL: [https://github.com/advisories/GHSA-h452-7996-h45h](https://github.com/advisories/GHSA-h452-7996-h45h)
    *   Fix: `npm audit fix --force`

*   **extend**:
    *   Description: Prototype Pollution in extend
    *   URL: [https://github.com/advisories/GHSA-qrmc-fj45-qfc2](https://github.com/advisories/GHSA-qrmc-fj45-qfc2)
    *   Fix: `npm audit fix --force`

*   **mem**:
    *   Description: Denial of Service in mem
    *   URL: [https://github.com/advisories/GHSA-4xcv-9jjx-gfj3](https://github.com/advisories/GHSA-4xcv-9jjx-gfj3)
    *   Fix: `npm audit fix --force`

*   **ms**:
    *   Description: Vercel ms Inefficient Regular Expression Complexity vulnerability
    *   URL: [https://github.com/advisories/GHSA-w9mr-4mfr-499f](https://github.com/advisories/GHSA-w9mr-4mfr-499f)
    *   Fix: `npm audit fix --force`

*   **nanoid**:
    *   Description: Predictable results in nanoid generation when given non-integer values
    *   URL: [https://github.com/advisories/GHSA-mwcw-c2x4-8c55](https://github.com/advisories/GHSA-mwcw-c2x4-8c55)
    *   Fix: `npm audit fix --force`

*   **nodemailer**:
    *   Description: nodemailer ReDoS when trying to send a specially crafted email
    *   URL: [https://github.com/advisories/GHSA-9h6g-pr28-7cqp](https://github.com/advisories/GHSA-9h6g-pr28-7cqp)
    *   Fix: `npm audit fix --force`

*   **serialize-javascript**:
    *   Description: Cross-site Scripting (XSS) in serialize-javascript
    *   URL: [https://github.com/advisories/GHSA-76p7-773f-r4q5](https://github.com/advisories/GHSA-76p7-773f-r4q5)
    *   Fix: `npm audit fix --force`

*   **tough-cookie**:
    *   Description: tough-cookie Prototype Pollution vulnerability
    *   URL: [https://github.com/advisories/GHSA-72xf-g2v4-qvf3](https://github.com/advisories/GHSA-72xf-g2v4-qvf3)
    *   Fix: No fix available

*   **yargs-parser**:
    *   Description: yargs-parser Vulnerable to Prototype Pollution
    *   URL: [https://github.com/advisories/GHSA-p9pc-299p-vxgp](https://github.com/advisories/GHSA-p9pc-299p-vxgp)
    *   Fix: `npm audit fix --force`

## Low

The `npm audit` command reported 7 low vulnerabilities, but did not provide details for them in the summary output.
