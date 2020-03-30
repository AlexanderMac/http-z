const HttpZError = require('../error');
const RequestBuilder = require('./request');
const ResponseBuilder = require('./response');

module.exports = (messageModel) => {
  if (!messageModel) {
    throw HttpZError.get('messageModel is required');
  }

  if (messageModel.method) {
    return RequestBuilder.build(messageModel);
  }
  if (messageModel.statusCode) {
    return ResponseBuilder.build(messageModel);
  }
  throw HttpZError.get('Unknown messageModel format');
};
