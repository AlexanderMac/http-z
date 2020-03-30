const _ = require('lodash');
const HttpZError = require('../error');
const RequestBuilder = require('./request');
const ResponseBuilder = require('./response');

module.exports = (messageModel) => {
  if (!messageModel) {
    throw HttpZError.get('messageModel is required');
  }

  if (!_.isNil(messageModel.method)) {
    return RequestBuilder.build(messageModel);
  }
  if (!_.isNil(messageModel.statusCode)) {
    return ResponseBuilder.build(messageModel);
  }
  throw HttpZError.get('Unknown messageModel format');
};
