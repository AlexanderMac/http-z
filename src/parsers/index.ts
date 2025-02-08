import { EOL, regexps } from '../constants'
import { HttpZError } from '../error'
import { head, isNil, isString } from '../utils'
import { HttpZRequestParser } from './request'
import { HttpZResponseParser } from './response'
import { HttpZParserModel, HttpZParserOptions } from './types'

export function parse(rawMessage: string, opts: HttpZParserOptions = {}): HttpZParserModel | never {
  if (isNil(rawMessage)) {
    throw HttpZError.get('rawMessage is required')
  }
  if (!isString(rawMessage)) {
    throw HttpZError.get('rawMessage must be a string')
  }

  const firstRow = head(rawMessage.split(EOL))
  if (regexps.requestStartRow.test(firstRow)) {
    return HttpZRequestParser.parse(rawMessage, opts)
  }
  if (regexps.responseStartRow.test(firstRow)) {
    return HttpZResponseParser.parse(rawMessage)
  }
  throw HttpZError.get('rawMessage has incorrect format')
}
