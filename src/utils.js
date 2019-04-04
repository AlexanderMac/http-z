'use strict';

const _             = require('lodash');
const {
  URL,
  URLSearchParams } = require('url');
const consts        = require('./consts');

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
exports.parseUrl = (url) => {
  if (!_.startsWith('http://') && !_.startsWith('https://')) {
    url = 'http://' + url;
  }
  return new URL(url);
};

// TODO: test it
exports.generateRelativeUrl = ({ path, params }) => {
  let paramsStr = '';
  if (!_.isEmpty(params)) {
    let urlSPs = new URLSearchParams(params);
    paramsStr = '?' + urlSPs.toString();
  }

  return '' +
    path +
    paramsStr;
};

exports.getHeaderName = (name) => {
  // capitalize: accept => Accept, accept-encoding => Accept-Encoding, etc
  return _.chain(name)
    .split('-')
    .map(_.capitalize)
    .join('-')
    .value();
};

// TODO: test it
exports.getBoundary = (contentType) => {
  if (!contentType || !contentType.params) {
    throw exports.getError('Request with ContentType=FormData must have a header with boundary');
  }

  let boundaryMatch = contentType.params.match(consts.regexps.boundary);
  if (!boundaryMatch) {
    throw exports.getError('Incorrect boundary, expected: boundary=value', contentType.params);
  }

  let boundaryAndValue = _.split(boundaryMatch, '=');
  if (boundaryAndValue.length !== 2) {
    throw exports.getError('Incorrect boundary, expected: boundary=value', contentType.params);
  }

  let boundaryValue =  _.trim(boundaryAndValue[1]);
  if (!boundaryValue) {
    throw exports.getError('Incorrect boundary, expected: boundary=value', contentType.params);
  }

  return boundaryValue;
};

exports.getError = (msg, data) => {
  if (data) {
    msg += `.\nDetails: "${data}"`;
  }

  let err = new Error(msg);
  err.type = 'HttpZError';
  return err;
};
