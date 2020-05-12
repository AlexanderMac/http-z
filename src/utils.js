const _ = require('lodash');
const qs = require('querystring');
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

exports.parseUrl = (url) => {
  const knownProtocols = ['http', 'https', 'ftp'];
  if (!_.find(knownProtocols, known => _.startsWith(url, known + '://'))) {
    url = 'http://' + url;
  }
  return new URL(url);
};

exports.generatePath = ({ path, queryParams }) => {
  if (_.isEmpty(queryParams)) {
    return path;
  }

  let queryParamsObj = _.reduce(queryParams, (result, param) => {
    result[param.name] = param.value || '';
    return result;
  }, {});
  return path + '?' + qs.stringify(queryParamsObj);
};

exports.capitalizeHeaderName = (name) => {
  // accept => Accept, accept-encoding => Accept-Encoding, etc
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
