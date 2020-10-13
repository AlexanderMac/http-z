const _ = require('lodash')
const qs = require('querystring')
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

exports.generatePath = (path, params) => {
  if (_.isEmpty(params)) {
    return path
  }
  let paramsObj = exports.convertParamsArrayToObject(params)

  return path + '?' + qs.stringify(paramsObj)
}

exports.convertParamsArrayToObject = (params) => {
  validators.validateArray(params, 'params')

  return _.reduce(params, (result, { name, value }, index) => {
    validators.validateNotEmptyString(name, 'param name', `param index: ${index}`)
    if (_.has(result, name)) {
      if (_.isArray(result[name])) {
        result[name].push(value)
      } else {
        result[name] = [result[name], value]
      }
    } else {
      result[name] = value || ''
    }
    return result
  }, {})
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
