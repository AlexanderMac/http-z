# http-z

[![Build Status](https://travis-ci.org/AlexanderMac/http-z.svg?branch=master)](https://travis-ci.org/AlexanderMac/http-z)
[![Code Coverage](https://codecov.io/gh/AlexanderMac/http-z/branch/master/graph/badge.svg)](https://codecov.io/gh/AlexanderMac/http-z)
[![npm version](https://badge.fury.io/js/http-z.svg)](https://badge.fury.io/js/http-z)

## Features

* Parse HTTP request/response message:
  - headers
  - cookies
  - body (supported contentTypes: `multipart/form-data`, `application/x-www-form-urlencoded`, `application/json`, `text/plain`)
* Build HTTP request/response message from object:
  - headers
  - cookies
  - body (supported contentTypes: `multipart/form-data`, `application/x-www-form-urlencoded`, `application/json`, `text/plain`)

## Commands

```sh
// Install
$ npm i http-z
```

## Usage

```js
const httpZ = require('http-z');

let requestMsg = [
  'GET http://example.com/features?p1=v1 HTTP/1.1',
  'Host: example.com',
  'Accept: */*',
  'Accept-Encoding: gzip,deflate',
  'Accept-Language: en-US;q=0.6, en;q=0.4',
  '',
  ''
].join('\n');

let requestObj = httpZ.parseRequest(requestMsg);
console.log(JSON.stringify(requestObj, null, 2));

/* output:
{ 
  method: 'GET',
  protocol: 'HTTP',
  protocolVersion: 'HTTP/1.1',
  host: 'example.com',
  path: '/features',
  params: { p1: 'v1' },
  headers: [
    { name: 'Accept', values: [ { value: '/', params: null } ] },
    { name: 'Accept-Encoding', values: [ 
      { value: 'gzip', params: null },
      { value: 'deflate', params: null }
    ]},
    { name: 'Accept-Language', values: [
      { value: 'en-US', params: 'q=0.6' },
      { value: 'en', params: 'q=0.4' } 
    ]}
  ],
  cookies: null,
  body: null
}
*/
```

## API

### parseRequest(httpRequestMsg, eol)
Parse HTTP request message and return request object.

- `httpRequestMsg` is a plain HTTP request message in string format.
- `eol` _end of line_, `\n` by default.

### parseResponse(httpResponseMsg, eol)
Parse HTTP response message and return response object.

- `httpResponseMsg` is a plain HTTP response message in string format.
- `eol` _end of line_, `\n` by default.

### buildRequest(httpRequestObj)
Build a plain HTTP request message from request object.

- `httpRequestObj` is request object.

### buildResponse(httpResponseObj)
Build a plain HTTP response message from response object.

- `httpResponseObj` is response object.

## Author
Alexander Mac

## Licence
Licensed under the MIT license.
