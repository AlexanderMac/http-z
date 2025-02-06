import { HttpProtocolVersion, regexps } from '../constants'
import { HttpZError } from '../error'
import { HttpZCookieParam } from '../types'
import { splitBy, head, tail, isEmpty } from '../utils'
import { HttpZBaseParser } from './base'
import { HttpZParserResponseModel } from './types'

export class HttpZResponseParser extends HttpZBaseParser {
  static parse(...params: ConstructorParameters<typeof HttpZResponseParser>): HttpZParserResponseModel {
    const instance = new HttpZResponseParser(...params)
    return instance.parse()
  }

  private protocolVersion!: HttpProtocolVersion
  private statusCode!: number
  private statusMessage!: string
  private cookieRows!: string[]

  private cookies: HttpZCookieParam[] | undefined

  parse(): HttpZParserResponseModel {
    this._parseMessageForRows()
    this._parseStartRow()
    this._parseHeaderRows()
    this._parseCookieRows()
    this._parseBodyRows()

    return this._generateModel()
  }

  protected override _parseMessageForRows(): void {
    super._parseMessageForRows()

    this.cookieRows = this.headerRows.filter(row => row.toLowerCase().startsWith('set-cookie'))
  }

  private _parseStartRow(): void {
    if (!regexps.responseStartRow.test(this.startRow)) {
      throw HttpZError.get('Incorrect startRow format, expected: HTTP-Version status-code reason-phrase', this.startRow)
    }

    const rowParts = this.startRow.split(' ')
    this.protocolVersion = <HttpProtocolVersion>rowParts[0].toUpperCase()
    this.statusCode = +rowParts[1]
    this.statusMessage = rowParts.splice(2).join(' ')
  }

  private _parseCookieRows(): void {
    if (isEmpty(this.cookieRows)) {
      return
    }

    // eslint-disable-next-line max-statements
    this.cookies = this.cookieRows.map(cookiesRow => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [unused, values] = splitBy(cookiesRow, ':')
      if (!values) {
        return <HttpZCookieParam>{} // TODO: ts-refactor, do we really need to return empty object?
      }

      const params = values.split(';')
      const paramWithName = head(params)
      const otherParams = tail(params)
      let [name, value] = paramWithName.split('=')
      name = name.trim()
      value = value.trim()
      if (!name) {
        throw HttpZError.get('Incorrect set-cookie pair format, expected: Name1=Value1;...', values)
      }

      const cookie: HttpZCookieParam = {
        name,
      }
      if (value) {
        cookie.value = value
      }
      if (otherParams.length > 0) {
        cookie.params = otherParams.map(param => param.trim())
      }

      return cookie
    })
  }

  private _generateModel(): HttpZParserResponseModel {
    const model: HttpZParserResponseModel = {
      protocolVersion: this.protocolVersion,
      statusCode: this.statusCode,
      statusMessage: this.statusMessage,
      headers: this.headers,
      headersSize: this.headersSize,
      bodySize: this.bodySize,
    }
    if (this.cookies) {
      model.cookies = this.cookies
    }
    if (this.body) {
      model.body = this.body
    }

    return model
  }
}
