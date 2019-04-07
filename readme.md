# http-z

[![Build Status](https://travis-ci.org/AlexanderMac/http-z.svg?branch=master)](https://travis-ci.org/AlexanderMac/http-z)
[![Code Coverage](https://codecov.io/gh/AlexanderMac/http-z/branch/master/graph/badge.svg)](https://codecov.io/gh/AlexanderMac/http-z)
[![npm version](https://badge.fury.io/js/http-z.svg)](https://badge.fury.io/js/http-z)

## Features

* Parse HTTP request/response message:
  - path params
  - headers
  - cookies
  - body, supported contentTypes:
    - `multipart/form-data`
    - `application/x-www-form-urlencoded`
    - `application/json`, `text/plain`
* Build HTTP request/response message from model:
  - path params
  - headers
  - cookies
  - body, supported contentTypes:
    - `multipart/form-data`
    - `application/x-www-form-urlencoded`
    - `application/json`, `text/plain`

## Commands

```sh
# Install
$ npm i http-z
```

## Usage

```js
const HttpZ = require('http-z');

let httpMessage = [
  'GET /features?p1=v1 HTTP/1.1',
  'Host: example.com',
  'Accept: */*',
  'Accept-Encoding: gzip,deflate',
  'Accept-Language: en-US;q=0.6, en;q=0.4',
  '',
  ''
].join('\n');

let httpModel = httpZ.parse({ httpMessage });
console.log(JSON.stringify(httpModel, null, 2));

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

let newHttpMessage = httpZ.build(httpModel);
console.log(newHttpMessage);

/* output:
GET /features?p1=v1 HTTP/1.1
Host: example.com
Accept: *//*
Accept-Encoding: gzip,deflate
Accept-Language: en-US;q=0.6, en;q=0.4

*/
```

## API
- **parse({ httpMessage, eol })**<br>
Parse HTTP request/response message and return model.

- `httpMessage` is a plain HTTP message in string format.
- `eol` end of line, `\n` by default.

- **build(httpModel)**<br>
Build HTTP message from request/response model.

- `httpModel` is HTTP model.

## Author
Alexander Mac

## Licence
Licensed under the MIT license.
