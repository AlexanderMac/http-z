'use strict';

const _              = require('lodash');
const consts         = require('../consts');
const HttpZError     = require('../error');
const RequestParser  = require('./request');
const ResponseParser = require('./response');

module.exports = (plainMessage, eol = '\n') => {
  if (!plainMessage) {
    throw HttpZError.get('plainMessage is required');
  }

  let firstRow = _.chain(plainMessage).split(eol).head().value();

  if (consts.regexps.requestStartRow.test(firstRow)) {
    return RequestParser.parse(plainMessage, eol);
  }
  if (consts.regexps.responseStartRow.test(firstRow)) {
    return ResponseParser.parse(plainMessage, eol);
  }
  throw HttpZError.get('Unknown plainMessage format', firstRow);
};
