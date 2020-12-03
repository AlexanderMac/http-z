# http-z

[![Build Status](https://travis-ci.org/AlexanderMac/http-z.svg?branch=master)](https://travis-ci.org/AlexanderMac/http-z)
[![Code Coverage](https://codecov.io/gh/AlexanderMac/http-z/branch/master/graph/badge.svg)](https://codecov.io/gh/AlexanderMac/http-z)
[![npm version](https://badge.fury.io/js/http-z.svg)](https://badge.fury.io/js/http-z)

## Features

HTTP request/response message parser/builder according to the rules defined in [RFC 7230](https://tools.ietf.org/html/rfc7230).

* Parse HTTP request/response raw message:
  - method, protocol, protocol version / status code, reason
  - query params
  - headers
  - cookies
  - body, the following contentTypes are supported:
    - `multipart/form-data`
    - `application/x-www-form-urlencoded`
    - `application/json`,
    - `text/plain`
* Build HTTP request/response raw message from model:
  - method, protocol, protocol version / status code, reason
  - query params
  - headers
  - cookies
  - body, the following contentTypes are supported:
    - `multipart/form-data`
    - `application/x-www-form-urlencoded`
    - `application/json`
    - `text/plain`

## Commands

```sh
# Install
$ npm i http-z
```

## Usage

```js
const httpZ = require('http-z')

let rawMessage = [
  'GET /features?p1=v1 HTTP/1.1',
  'Host: example.com',
  'Accept: */*',
  'Accept-Encoding: gzip,deflate',
  'Accept-Language: en-US;q=0.6, en;q=0.4',
  '',
  ''
].join('\r\n')

let messageModel = httpZ.parse(rawMessage)
console.log(JSON.stringify(messageModel, null, 2))

/* output:
{ 
  method: 'GET',
  protocol: 'HTTP',
  protocolVersion: 'HTTP/1.1',
  host: 'example.com',
  path: '/features',
  params: { p1: 'v1' },
  headers: [
    { name: 'Accept', values: [ { value: '/' } ] },
    { name: 'Accept-Encoding', values: [ 
      { value: 'gzip' },
      { value: 'deflate' }
    ]},
    { name: 'Accept-Language', values: [
      { value: 'en-US', params: 'q=0.6' },
      { value: 'en', params: 'q=0.4' } 
    ]}
  ],
  headersSize: 98,
  bodySize: 0
}
*/

rawMessage = httpZ.build(messageModel)
console.log(rawMessage)

/* output:
GET /features?p1=v1 HTTP/1.1
Host: example.com
Accept: *//*
Accept-Encoding: gzip,deflate
Accept-Language: en-US;q=0.6, en;q=0.4

*/
```

## API

### parse(rawMessage)
Parses HTTP request/response raw message and returns a model.

- `rawMessage` is HTTP raw message.

### build(messageModel)
Builds HTTP request/response raw message from the model.

- `messageModel` is HTTP message model.

## References
- [RFC 7230: Hypertext Transfer Protocol (HTTP/1.1)](https://tools.ietf.org/html/rfc7230)
- [RFC 7578: Returning Values from Forms: multipart/form-data](https://tools.ietf.org/html/rfc7578)
- [RFC 2046: Multipurpose Internet Mail Extensions](https://tools.ietf.org/html/rfc2046)

## Author
Alexander Mac

## Licence
Licensed under the MIT license.
