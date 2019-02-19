'use strict';

const defRequestParser   = require('./src/parser/requests/default');
const defResponseParser  = require('./src/parser/responses/default');
const defRequestBuilder  = require('./src/builder/request');
const defResponseBuilder = require('./src/builder/response');

module.exports = {
  parseRequest: defRequestParser.parse,
  parseResponse: defResponseParser.parse,
  buildRequest: defRequestBuilder.build,
  buildResponse: defResponseBuilder.build
};
