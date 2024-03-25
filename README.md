<p align="center">
  <h1 align="center">http-z</h1>
  <p align="center">HTTP message (request/response) parser/builder according to the rules defined in <a href="https://tools.ietf.org/html/rfc7230">RFC 7230</a></p>
  <p align="center">Works in Node.js and in the browser.</p>
  <p align="center">
    <a href="https://github.com/alexandermac/http-z/actions/workflows/ci.yml?query=branch%3Amaster"><img src="https://github.com/alexandermac/http-z/actions/workflows/ci.yml/badge.svg" alt="Build Status"></a>
    <a href="https://codecov.io/gh/AlexanderMac/http-z"><img src="https://codecov.io/gh/AlexanderMac/http-z/branch/master/graph/badge.svg" alt="Code Coverage"></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/alexandermac/http-z.svg" alt="License"></a>
    <a href="https://badge.fury.io/js/http-z"><img src="https://badge.fury.io/js/http-z.svg" alt="npm version"></a>
  </p>
  <h3 align="center"><a href="https://alexandermac.github.io/http-z">Demo</a></h3>
</p>

### Install

```bash
$ pnpm i http-z
```

### Usage

```js
const httpZ = require('http-z')

const plainMessage = [
  'GET /features?p1=v1 HTTP/1.1',
  'Host: example.com',
  'Accept: *',
  'Accept-Encoding: gzip,deflate',
  'Accept-Language: en-US;q=0.6, en;q=0.4',
  '',
  ''
].join('\r\n')

const messageModel = httpZ.parse(plainMessage)
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

const plainMessageParsed = httpZ.build(messageModel)
console.log(plainMessageParsed)

/* output:
GET /features?p1=v1 HTTP/1.1
Host: example.com
Accept: *
Accept-Encoding: gzip,deflate
Accept-Language: en-US;q=0.6, en;q=0.4


*/
```

### API

##### parse(rawMessage, opts)
Parses HTTP request/response raw message and returns a model.

- `rawMessage` is HTTP raw message.
- `opts` - options object, can be skipped.

##### build(messageModel, opts)
Builds HTTP request/response raw message from the model.

- `messageModel` is HTTP message model.
- `opts` - options object, can be skipped.

### References
- [RFC 7230: Hypertext Transfer Protocol (HTTP/1.1)](https://tools.ietf.org/html/rfc7230)
- [RFC 7578: Returning Values from Forms: multipart/form-data](https://tools.ietf.org/html/rfc7578)
- [RFC 2046: Multipurpose Internet Mail Extensions](https://tools.ietf.org/html/rfc2046)

### License
Licensed under the MIT license.

### Author
Alexander Mac
