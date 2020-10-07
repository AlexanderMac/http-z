const _ = require('lodash');
const consts = require('../consts');
const HttpZError = require('../error');
const RequestParser = require('./request');
const ResponseParser = require('./response');

module.exports = (plainMessage) => {
  if (!plainMessage) {
    throw HttpZError.get('plainMessage is required');
  }

  let firstRow = _.chain(plainMessage).split(consts.eol).head().value();
  if (consts.regexps.requestStartRow.test(firstRow)) {
    return RequestParser.parse(plainMessage);
  }
  if (consts.regexps.responseStartRow.test(firstRow)) {
    return ResponseParser.parse(plainMessage);
  }
  throw HttpZError.get('Unknown plainMessage format');
};
