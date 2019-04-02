'use strict';

const _              = require('lodash');
const consts         = require('../consts');
const utils          = require('../utils');
const RequestParser  = require('./request');
const ResponseParser = require('./response');

module.exports = ({ httpMessage, eol = '\n' } = {}) => {
  if (!httpMessage) {
    throw utils.getErrorMessage('httpMessage is required');
  }

  let firstRow = _.chain(httpMessage).split(eol).head().value();

  if (consts.regexps.requestStartRow.test(firstRow)) {
    return RequestParser.parse({ httpMessage, eol });
  }
  if (consts.regexps.responseStartRow.test(firstRow)) {
    return ResponseParser.parse({ httpMessage, eol });
  }
  throw new Error('Unknown httpMessage format');
};
