const _ = require('lodash')
const consts = require('../consts')
const HttpZError = require('../error')
const RequestParser = require('./request')
const ResponseParser = require('./response')

module.exports = (rawMessage, opts = {}) => {
  if (_.isNil(rawMessage)) {
    throw HttpZError.get('rawMessage is required')
  }
  if (!_.isString(rawMessage)) {
    throw HttpZError.get('rawMessage must be a string')
  }

  let firstRow = _.chain(rawMessage).split(consts.EOL).head().value()
  if (consts.regexps.requestStartRow.test(firstRow)) {
    return RequestParser.parse(rawMessage, opts)
  }
  if (consts.regexps.responseStartRow.test(firstRow)) {
    return ResponseParser.parse(rawMessage)
  }
  throw HttpZError.get('rawMessage has incorrect format')
}
