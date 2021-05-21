const _ = require('lodash')
const validators = require('./validators')

exports.splitByDelimeter = (str, delimiter) => {
  if (_.isEmpty(str)) {
    return []
  }

  let delimiterIndex = str.indexOf(delimiter)
  if (delimiterIndex === -1) {
    return []
  }

  let res = [str.slice(0, delimiterIndex), str.slice(delimiterIndex + delimiter.length)]
  res[0] = _.trim(res[0], ' ')
  res[1] = _.trim(res[1], ' ')

  return res
}

exports.parseUrl = (path, origin) => {
  if (!origin) {
    origin = path
    path = null
  }
  const knownProtocols = ['http', 'https']
  if (!_.find(knownProtocols, known => _.startsWith(origin, known + '://'))) {
    origin = 'http://' + origin
  }

  let parsedUrl = path ? new URL(path, origin) : new URL(origin)
  let protocol = parsedUrl.protocol.replace(':', '').toUpperCase()
  let params = []
  parsedUrl.searchParams.forEach((value, name) => params.push({ name, value }))

  return {
    protocol,
    host: parsedUrl.host,
    path: parsedUrl.pathname,
    params
  }
}

// eslint-disable-next-line max-params
exports.generateUrl = (protocol, host, port, path, params) => {
  let result = ''
  if (host) {
    result += protocol.toLowerCase() + '://' + host
    if (port && !host.includes(':')) {
      result += ':' + port
    }
  }
  let pathWithParams = exports.generatePath(path, params)
  result += pathWithParams

  return result
}

exports.generatePath = (path, params) => {
  if (_.isEmpty(params)) {
    return path
  }
  let paramPairs = exports.convertParamsArrayToPairs(params)

  return path + '?' + new URLSearchParams(paramPairs).toString()
}

exports.convertParamsArrayToPairs = (params) => {
  validators.validateArray(params, 'params')

  return _.map(params, ({ name, value }) => [
    name,
    exports.getEmptyStringForUndefined(value)]
  )
}

exports.pretifyHeaderName = (name) => {
  return _.chain(name)
    .split('-')
    .map(_.capitalize)
    .join('-')
    .value()
}

exports.getEmptyStringForUndefined = (val) => {
  if (_.isUndefined(val)) {
    return ''
  }
  return val
}

exports.extendIfNotUndefined = (obj, fieldName, fieldValue) => {
  if (!_.isUndefined(fieldValue)) {
    obj[fieldName] = fieldValue
  }
}
