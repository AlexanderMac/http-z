'use strict';

const _ = require('lodash');

exports.splitIntoTwoParts = (str, delimiter) => {
  if (_.isEmpty(str)) {
    return [];
  }

  let delimiterIndex = str.indexOf(delimiter);
  if (delimiterIndex === -1) {
    return [];
  }

  let res = [str.slice(0, delimiterIndex), str.slice(delimiterIndex + delimiter.length)];
  res[0] = _.trim(res[0], ' ');
  res[1] = _.trim(res[1], ' ');

  return res;
};

// TODO: test it
exports.getErrorMessage = (msg, data) => {
  if (data) {
    msg += `. Data: ${data}`;
  }

  let err = new Error(msg);
  err.type = 'HttpZ Error';
  return err;
};

exports.getHostname = (url) => {
  let hostname;

  if (url.indexOf('//') > -1) {
    hostname = url.split('/')[2];
  } else {
    hostname = url.split('/')[0];
  }

  // remove port number and '?'
  hostname = hostname.split(':')[0];
  hostname = hostname.split('?')[0];

  return hostname;
};
