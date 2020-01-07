const _ = require('lodash');
const consts = require('../consts');
const HttpZError = require('../error');
const RequestParser = require('./request');
const ResponseParser = require('./response');

module.exports = (plainMessage) => {
  if (!plainMessage) {
    throw HttpZError.get('plainMessage is required');
  }

  let res;
  res = _tryParse(plainMessage, '\r\n');
  if (res) {
    return res;
  }
  res = _tryParse(plainMessage, '\n');
  if (res) {
    return res;
  }

  throw HttpZError.get('Unknown plainMessage format');
};

function _tryParse(plainMessage, eol) {
  let firstRow = _.chain(plainMessage).split(eol).head().value();
  if (consts.regexps.requestStartRow.test(firstRow)) {
    return RequestParser.parse(plainMessage, eol);
  }
  if (consts.regexps.responseStartRow.test(firstRow)) {
    return ResponseParser.parse(plainMessage, eol);
  }
}
