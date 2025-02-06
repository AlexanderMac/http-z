import { HttpZParam } from './types'

export type ParsedUrl = {
  protocol: string
  host: string
  path: string
  params: HttpZParam[]
}

export const getLibVersion = (): string => {
  return '8.0.0-dev'
}

export const splitBy = (str: string, delimiter: string): string[] => {
  if (isEmpty(str)) {
    return []
  }

  const delimiterIndex = str.indexOf(delimiter)
  if (delimiterIndex === -1) {
    return []
  }

  const result = [str.slice(0, delimiterIndex), str.slice(delimiterIndex + delimiter.length)]
  result[0] = result[0].trim()
  result[1] = result[1].trim()

  return result
}

export const isAbsoluteUrl = (url: string): boolean => {
  // Don't match Windows paths `c:\`
  if (/^[a-zA-Z]:\\/.test(url)) {
    return false
  }

  // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
  // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)
}

export const parseUrl = (url: string, host: string): ParsedUrl => {
  const supportedProtocols = ['http', 'https']
  if (!supportedProtocols.some(known => host.startsWith(known + '://'))) {
    host = 'http://' + host
  }

  const parsedUrl = url ? new URL(url, host) : new URL(host)
  const protocol = parsedUrl.protocol.replace(':', '').toUpperCase()
  const params: HttpZParam[] = []
  parsedUrl.searchParams.forEach((value, name) => params.push({ name, value }))

  return {
    protocol,
    host: parsedUrl.host,
    path: parsedUrl.pathname,
    params,
  }
}

export const arrayToPairs = (params: HttpZParam[]): string[][] => {
  return params.map(({ name, value }) => [name, getEmptyStringForUndefined(value)])
}

export const prettifyHeaderName = (name: string | null | undefined): string => {
  return (name ?? '').toString().split('-').map(capitalize).join('-')
}

export const getEmptyStringForUndefined = (value: string | null | undefined): string => {
  if (isUndefined(value)) {
    return ''
  }
  return value!
}

export const extendIfNotUndefined = (obj: object, fieldName: string, fieldValue: string | undefined): void => {
  if (!isUndefined(fieldValue)) {
    ;(obj as Record<string, string>)[fieldName] = fieldValue!
  }
}

// **********************
// Lodash native replaces
export const isUndefined = (value: unknown): boolean => {
  return value === undefined
}

export const isNil = (value: unknown): boolean => {
  return value == null
}

export const isEmpty = (value: unknown): boolean => {
  if (isNil(value)) {
    return true
  }
  if ((<Array<unknown>>value).length || (<Set<unknown>>value).size) {
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

export const isString = (value: unknown): boolean => {
  return typeof value === 'string'
}

export const isNumber = (value: unknown): boolean => {
  return typeof value === 'number'
}

export const isArray = (value: unknown): boolean => {
  return Array.isArray(value)
}

export const isError = (value: unknown): boolean => {
  return value instanceof Error
}

export const isPlainObject = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  if (Object.prototype.toString.call(value) !== '[object Object]') {
    return false
  }
  const proto = Object.getPrototypeOf(value) as object | null
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

export const capitalize = (value: string): string => {
  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''
}

export const head = <T>(value: T[]): T => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_head, ..._tail] = value
  return _head
}

export const tail = <T>(value: T[]): T[] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_head, ..._tail] = value
  return _tail
}

export const trim = (value: string, chars: string | undefined = undefined): string => {
  if (isNil(value)) {
    return value
  }
  value = value.toString()

  if (chars === undefined || chars === '\\s') {
    return value.trim()
  }
  return value.replace(new RegExp(`^([${chars}]*)(.*?)([${chars}]*)$`), '$2')
}

export const trimEnd = (value: string, chars: string | undefined = undefined): string => {
  if (isNil(value)) {
    return value
  }
  value = value.toString()

  if (chars === undefined || chars === '\\s') {
    return value.trimEnd()
  }
  return value.replace(new RegExp(`^(.*?)([${chars}]*)$`), '$1')
}
