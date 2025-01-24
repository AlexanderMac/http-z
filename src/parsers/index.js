const consts = require('../consts')
const { head, isNil, isString } = require('../utils')
const HttpZError = require('../error')
const RequestParser = require('./request')
const ResponseParser = require('./response')

module.exports = (rawMessage, opts = {}) => {
  if (isNil(rawMessage)) {
    throw HttpZError.get('rawMessage is required')
  }
  if (!isString(rawMessage)) {
    throw HttpZError.get('rawMessage must be a string')
  }

  const firstRow = head(rawMessage.split(consts.EOL))
  if (consts.regexps.requestStartRow.test(firstRow)) {
    return RequestParser.parse(rawMessage, opts)
  }
  if (consts.regexps.responseStartRow.test(firstRow)) {
    return ResponseParser.parse(rawMessage)
  }
  throw HttpZError.get('rawMessage has incorrect format')
}
