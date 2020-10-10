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

exports.parseUrl = (path, origin) => {
  if (!origin) {
    origin = path;
    path = null;
  }
  const knownProtocols = ['http', 'https'];
  if (!_.find(knownProtocols, known => _.startsWith(origin, known + '://'))) {
    origin = 'http://' + origin;
  }

  let parsedUrl = path ? new URL(path, origin) : new URL(origin);
  let protocol = parsedUrl.protocol.replace(':', '').toUpperCase();
  let params = [];
  parsedUrl.searchParams.forEach((value, name) => params.push({ name, value }));

  return {
    protocol,
    host: parsedUrl.host,
    path: parsedUrl.pathname,
    params
  };
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

exports.pretifyHeaderName = (name) => {
  // accept => Accept, accept-encoding => Accept-Encoding, etc
  return _.chain(name)
    .split('-')
    .map(_.capitalize)
    .join('-')
    .value();
};

exports.getEmptyStringForUndefined = (val) => {
  if (_.isUndefined(val)) {
    return '';
  }
  return val;
};

exports.extendIfNotUndefined = (obj, fieldName, fieldValue) => {
  if (!_.isUndefined(fieldValue)) {
    obj[fieldName] = fieldValue;
  }
};
