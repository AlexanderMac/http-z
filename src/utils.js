exports.getLibVersion = () => {
  return '8.0.0-dev'
}

exports.splitByDelimiter = (str, delimiter) => {
  if (exports.isEmpty(str)) {
    return []
  }

  const delimiterIndex = str.indexOf(delimiter)
  if (delimiterIndex === -1) {
    return []
  }

  const result = [str.slice(0, delimiterIndex), str.slice(delimiterIndex + delimiter.length)]
  result[0] = result[0].trim(' ')
  result[1] = result[1].trim(' ')

  return result
}

exports.isAbsoluteUrl = (url) => {
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
  if (!supportedProtocols.some((known) => host.startsWith(known + '://'))) {
    host = 'http://' + host
  }

  const parsedUrl = url ? new URL(url, host) : new URL(host)
  const protocol = parsedUrl.protocol.replace(':', '').toUpperCase()
  const params = []
  parsedUrl.searchParams.forEach((value, name) => params.push({ name, value }))

  return {
    protocol,
    host: parsedUrl.host,
    path: parsedUrl.pathname,
    params,
  }
}

exports.convertParamsArrayToPairs = (params) => {
  return params.map(({ name, value }) => [name, exports.getEmptyStringForUndefined(value)])
}

exports.prettifyHeaderName = (name) => {
  return (name ?? '').toString().split('-').map(exports.capitalize).join('-')
}

exports.getEmptyStringForUndefined = (val) => {
  if (exports.isUndefined(val)) {
    return ''
  }
  return val
}

exports.extendIfNotUndefined = (obj, fieldName, fieldValue) => {
  if (!exports.isUndefined(fieldValue)) {
    obj[fieldName] = fieldValue
  }
}

// **********************
// Lodash native replaces
exports.isUndefined = (value) => {
  return value === undefined
}

exports.isNil = (value) => {
  return value == null
}

exports.isEmpty = (value) => {
  if (value?.length || value?.size) {
    return false
  }
  if (typeof value !== 'object') {
    return true
  }
  for (const key in value) {
    if (Object.hasOwn(value, key)) {
      return false
    }
  }
  return true
}

exports.isString = (value) => {
  return typeof value === 'string'
}

exports.isNumber = (value) => {
  return typeof value === 'number'
}

exports.isArray = (value) => {
  return Array.isArray(value)
}

exports.isError = (value) => {
  return value instanceof Error
}

exports.isPlainObject = (value) => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false
  }
  const proto = Object.getPrototypeOf(value)
  if (proto === null) {
    return true
  }

  const Ctor = Object.prototype.hasOwnProperty.call(proto, 'constructor') && proto.constructor
  return (
    typeof Ctor === 'function' &&
    Ctor instanceof Ctor &&
    Function.prototype.call(Ctor) === Function.prototype.call(value)
  )
}

exports.capitalize = (value) => {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''
}

exports.head = (value) => {
  // eslint-disable-next-line no-unused-vars
  const [head, ...tail] = value
  return head
}

exports.tail = (value) => {
  // eslint-disable-next-line no-unused-vars
  const [head, ...tail] = value
  return tail
}

exports.trim = (value, chars = undefined) => {
  if (exports.isNil(value)) {
    return value
  }
  value = value.toString()
  if (chars === undefined || chars === '\\s') {
    return value.trim()
  }
  return value.replace(new RegExp(`^([${chars}]*)(.*?)([${chars}]*)$`), '$2')
}

exports.trimEnd = (value, chars = undefined) => {
  if (exports.isNil(value)) {
    return value
  }
  value = value.toString()
  if (chars === undefined || chars === '\\s') {
    return value.trimEnd()
  }
  return value.replace(new RegExp(`^(.*?)([${chars}]*)$`), '$1')
}
