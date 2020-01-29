# http-z

[![Build Status](https://travis-ci.org/AlexanderMac/http-z.svg?branch=master)](https://travis-ci.org/AlexanderMac/http-z)
[![Code Coverage](https://codecov.io/gh/AlexanderMac/http-z/branch/master/graph/badge.svg)](https://codecov.io/gh/AlexanderMac/http-z)
[![npm version](https://badge.fury.io/js/http-z.svg)](https://badge.fury.io/js/http-z)

## Features

* Parse HTTP request/response plain message:
  - path params
  - headers
  - cookies
  - body, supported contentTypes:
    - `multipart/form-data`
    - `application/x-www-form-urlencoded`
    - `application/json`,
    - `text/plain`
* Build HTTP request/response plain message from model:
  - path params
  - headers
  - cookies
  - body, supported contentTypes:
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
const httpZ = require('http-z');

let plainMessage = [
  'GET /features?p1=v1 HTTP/1.1',
  'Host: example.com',
  'Accept: */*',
  'Accept-Encoding: gzip,deflate',
  'Accept-Language: en-US;q=0.6, en;q=0.4',
  '',
  ''
].join('\n');

let messageModel = httpZ.parse(plainMessage);
console.log(JSON.stringify(messageModel, null, 2));

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
  messageSize: 129,
  headersSize: 98,
  bodySize: 0
}
*/

plainMessage = httpZ.build(messageModel);
console.log(plainMessage);

/* output:
GET /features?p1=v1 HTTP/1.1
Host: example.com
Accept: *//*
Accept-Encoding: gzip,deflate
Accept-Language: en-US;q=0.6, en;q=0.4

*/
```

## API

### parse(plainMessage)
Parse HTTP request/response plain message and return model.

- `plainMessage` is HTTP plain message.

### build(messageModel)
Build HTTP request/response plain message from model.

- `messageModel` is HTTP message model.

## Author
Alexander Mac

## Licence
Licensed under the MIT license.
