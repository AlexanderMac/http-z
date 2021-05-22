# http-z

[![Build Status](https://github.com/AlexanderMac/http-z/workflows/CI/badge.svg)](https://github.com/AlexanderMac/http-z/actions?query=workflow%3ACI)
[![Code Coverage](https://codecov.io/gh/AlexanderMac/http-z/branch/master/graph/badge.svg)](https://codecov.io/gh/AlexanderMac/http-z)
[![npm version](https://badge.fury.io/js/http-z.svg)](https://badge.fury.io/js/http-z)

### Features

HTTP message (request/response) parser/builder according to the rules defined in [RFC 7230](https://tools.ietf.org/html/rfc7230). Works in Node.js and in the browser.

### Install

```bash
$ npm i http-z
```

### Usage

```js
const httpZ = require('http-z')

let rawMessage = [
  'GET /features?p1=v1 HTTP/1.1',
  'Host: example.com',
  'Accept: *',
  'Accept-Encoding: gzip,deflate',
  'Accept-Language: en-US;q=0.6, en;q=0.4',
  '',
  ''
].join('\r\n')

let messageModel = httpZ.parse(rawMessage)
console.log(JSON.stringify(messageModel, null, 2))

/* output:
{
  "protocolVersion": "HTTP/1.1",
  "method": "GET",
  "target": "/features?p1=v1",
  "host": "example.com",
  "path": "/features",
  "headersSize": 135,
  "bodySize": 0,
  "queryParams": [
    { "name": "p1", "value": "v1" }
  ],
  "headers": [
    { "name": "Host", "value": "example.com" },
    { "name": "Accept", value": "*" },
    { "name": "Accept-Encoding", "value": "gzip,deflate" },
    { "name": "Accept-Language", "value": "en-US;q=0.6, en;q=0.4" }
  ]
}
*/

rawMessage = httpZ.build(messageModel)
console.log(rawMessage)

/* output:
GET /features?p1=v1 HTTP/1.1
Host: example.com
Accept: *
Accept-Encoding: gzip,deflate
Accept-Language: en-US;q=0.6, en;q=0.4


*/
```

### API

##### parse(rawMessage)
Parses HTTP request/response raw message and returns a model.

- `rawMessage` is HTTP raw message.

##### build(messageModel)
Builds HTTP request/response raw message from the model.

- `messageModel` is HTTP message model.

### References
- [RFC 7230: Hypertext Transfer Protocol (HTTP/1.1)](https://tools.ietf.org/html/rfc7230)
- [RFC 7578: Returning Values from Forms: multipart/form-data](https://tools.ietf.org/html/rfc7578)
- [RFC 2046: Multipurpose Internet Mail Extensions](https://tools.ietf.org/html/rfc2046)

### Licence
Licensed under the MIT license.

### Author
Alexander Mac
