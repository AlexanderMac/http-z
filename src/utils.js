const _ = require('lodash')
const validators = require('./validators')

exports.splitByDelimiter = (str, delimiter) => {
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

exports.isAbsoluteUrl = url => {
  // Don't match Windows paths `c:\`
  if (/^[a-zA-Z]:\\/.test(url)) {
    return false
  }

  // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
  // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)
}

exports.parseUrl = (url, host) => {
  if (!host) {
    host = url
    url = null
  }
  const supportedProtocols = ['http', 'https']
  if (!_.find(supportedProtocols, known => _.startsWith(host, known + '://'))) {
    host = 'http://' + host
  }

  let parsedUrl = url ? new URL(url, host) : new URL(host)
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

exports.convertParamsArrayToPairs = params => {
  validators.validateArray(params, 'params')

  return _.map(params, ({ name, value }) => [name, exports.getEmptyStringForUndefined(value)])
}

exports.prettifyHeaderName = name => {
  return _.chain(name).split('-').map(_.capitalize).join('-').value()
}

exports.getEmptyStringForUndefined = val => {
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

exports.getLibVersion = () => {
  return '7.1.3'
}
