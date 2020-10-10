const _ = require('lodash');
const qs = require('querystring');

exports.splitByDelimeter = (str, delimiter) => {
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

// TODO: rename to pretifyHeaderName
exports.capitalizeHeaderName = (name) => {
  // accept => Accept, accept-encoding => Accept-Encoding, etc
  return _.chain(name)
    .split('-')
    .map(_.capitalize)
    .join('-')
    .value();
};

// TODO: test it
exports.getEmptyStringForUndefined = (val) => {
  if (_.isUndefined(val)) {
    return '';
  }
  return val;
};

// TODO: test it
exports.extendIfNotUndefined = (obj, fieldName, fieldValue) => {
  if (!_.isUndefined(fieldValue)) {
    obj[fieldName] = fieldValue;
  }
};
