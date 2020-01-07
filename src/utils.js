const _ = require('lodash');
const consts = require('./consts');
const HttpZError = require('./error');

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
exports.generateRelativeUrl = ({ path, queryParams }) => {
  let queryParamsStr = '';
  if (!_.isEmpty(queryParams)) {
    let searchParams = _.map(queryParams, ({ name, value }) => {
      return [name, exports.getEmptyStringForUndefined(value)];
    });
    let urlSPs = new URLSearchParams(searchParams);
    queryParamsStr = '?' + urlSPs.toString();
  }

  return '' +
    path +
    queryParamsStr;
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
    throw HttpZError.get('Request with ContentType=FormData must have a header with boundary');
  }

  let boundaryMatch = contentType.params.match(consts.regexps.boundary);
  if (!boundaryMatch) {
    throw HttpZError.get('Incorrect boundary, expected: boundary=value', contentType.params);
  }

  let boundaryAndValue = _.split(boundaryMatch, '=');
  if (boundaryAndValue.length !== 2) {
    throw HttpZError.get('Incorrect boundary, expected: boundary=value', contentType.params);
  }

  let boundaryValue = _.trim(boundaryAndValue[1]);
  if (!boundaryValue) {
    throw HttpZError.get('Incorrect boundary, expected: boundary=value', contentType.params);
  }

  return boundaryValue;
};

// TODO: test it
exports.getEmptyStringForUndefined = (val) => {
  if (_.isUndefined(val)) {
    return '';
  }
  return val;
};
