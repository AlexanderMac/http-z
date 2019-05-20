'use strict';

const utils           = require('../utils');
const RequestBuilder  = require('./request');
const ResponseBuilder = require('./response');

module.exports = (messageModel) => {
  if (!messageModel) {
    throw utils.getError('messageModel is required');
  }

  if (messageModel.method) {
    return RequestBuilder.build(messageModel);
  }
  if (messageModel.statusCode) {
    return ResponseBuilder.build(messageModel);
  }
  throw new Error('Unknown messageModel format');
};
