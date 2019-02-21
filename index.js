'use strict';

const defRequestParser    = require('./src/parser/requests/default');
const defResponseParser   = require('./src/parser/responses/default');
const axiosRequestParser  = require('./src/parser/requests/axios');
const axiosResponseParser = require('./src/parser/responses/axios');
const defRequestBuilder   = require('./src/builder/request');
const defResponseBuilder  = require('./src/builder/response');

module.exports = {
  parseRequest: defRequestParser.parse,
  parseResponse: defResponseParser.parse,
  parserAxiosRequest: axiosRequestParser.parser,
  parserAxiosResponse: axiosResponseParser.parser,
  buildRequest: defRequestBuilder.build,
  buildResponse: defResponseBuilder.build
};
