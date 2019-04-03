'use strict';

const utils           = require('../utils');
const RequestBuilder  = require('./request');
const ResponseBuilder = require('./response');

module.exports = (httpModel) => {
  if (!httpModel) {
    throw utils.getError('httpModel is required');
  }

  if (httpModel.method) {
    return RequestBuilder.build(httpModel);
  }
  if (httpModel.statusCode) {
    return ResponseBuilder.build(httpModel);
  }
  throw new Error('Unknown httpModel format');
};
