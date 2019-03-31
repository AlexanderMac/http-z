'use strict';

const RequestBuilder  = require('./request');
const ResponseBuilder = require('./response');

// TODO: test it
module.exports = (params = {}) => {
  if (params.method) {
    return RequestBuilder.build(params);
  }
  if (params.statusCode) {
    return ResponseBuilder.build(params);
  }
  throw new Error('Unknown message format');
};
