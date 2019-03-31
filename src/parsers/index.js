'use strict';

const _              = require('lodash');
const consts         = require('../consts');
const RequestParser  = require('./request');
const ResponseParser = require('./response');

// TODO: test it
module.exports = ({ httpMessage, eol = '\n' } = {}) => {
  let firstRow = _.chain(httpMessage).split(eol).head().value();

  if (consts.regexps.requestStartRow.test(firstRow)) {
    return RequestParser.parse({ httpMessage, eol });
  }
  if (consts.regexps.responseStartRow.test(firstRow)) {
    return ResponseParser.parse({ httpMessage, eol });
  }
  throw new Error('Unknown message format');
};
