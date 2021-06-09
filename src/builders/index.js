const _ = require('lodash')
const HttpZError = require('../error')
const RequestBuilder = require('./request')
const ResponseBuilder = require('./response')

module.exports = (messageModel, opts = {}) => {
  if (_.isNil(messageModel)) {
    throw HttpZError.get('messageModel is required')
  }
  if (!_.isPlainObject(messageModel)) {
    throw HttpZError.get('messageModel must be a plain object')
  }
  if (messageModel.method) {
    return RequestBuilder.build(messageModel, opts)
  }
  if (messageModel.statusCode) {
    return ResponseBuilder.build(messageModel)
  }
  throw HttpZError.get('messageModel has incorrect format')
}
