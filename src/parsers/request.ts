import { assertNotEmptyString } from '../assertions'
import { HttpMethod, HttpProtocolVersion, regexps } from '../constants'
import { HttpZError } from '../error'
import { HttpZCookieParam, HttpZParam } from '../types'
import { splitBy, parseUrl } from '../utils'
import { HttpZBaseParser } from './base'
import { HttpZParserOptions, HttpZParserRequestModel } from './types'

const SUPER_RANDOM_HOST = 'superrandomhost28476561927456.com'

export class HttpZRequestParser extends HttpZBaseParser {
  static parse(...params: ConstructorParameters<typeof HttpZRequestParser>): HttpZParserRequestModel {
    const instance = new HttpZRequestParser(...params)
    return instance.parse()
  }

  private method!: HttpMethod
  private target!: string
  private host!: string
  private path!: string
  private protocolVersion!: HttpProtocolVersion
  private hostRow: string | undefined
  private cookiesRow: string | undefined

  private queryParams: HttpZParam[] | undefined
  private cookies: HttpZCookieParam[] | undefined

  constructor(
    rawMessage: string,
    private readonly opts: HttpZParserOptions,
  ) {
    super(rawMessage)
  }

  parse(): HttpZParserRequestModel {
    this._parseMessageForRows()
    this._parseHostRow()
    this._parseStartRow()
    this._parseHeaderRows()
    this._parseCookieRows()
    this._parseBodyRows()

    return this._generateModel()
  }

  protected override _parseMessageForRows(): void {
    super._parseMessageForRows()

    this.hostRow = this.headerRows.find(row => row.toLowerCase().startsWith('host:'))
    this.cookiesRow = this.headerRows.find(row => row.toLowerCase().startsWith('cookie:'))
  }

  private _parseHostRow(): void {
    if (this.opts.mandatoryHost) {
      assertNotEmptyString(this.hostRow, 'host header')
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [unused, value] = splitBy(this.hostRow || '', ':')
    if (this.opts.mandatoryHost) {
      assertNotEmptyString(value, 'host header value')
    }

    this.host = value
  }

  // eslint-disable-next-line max-statements
  private _parseStartRow(): void {
    if (!regexps.requestStartRow.test(this.startRow)) {
      throw HttpZError.get('Incorrect startRow format, expected: Method request-target HTTP-Version', this.startRow)
    }

    const rowParts = this.startRow.split(' ')
    this.method = rowParts[0].toUpperCase() as HttpMethod
    this.protocolVersion = rowParts[2].toUpperCase() as HttpProtocolVersion
    this.target = rowParts[1]

    let parsedUrl
    try {
      parsedUrl = parseUrl(this.target, SUPER_RANDOM_HOST)
    } catch (err) {
      if ((err as { code: string }).code === 'ERR_INVALID_URL') {
        throw HttpZError.get('Invalid target', this.target)
      }
      throw err
    }

    if (!this.host) {
      this.host = parsedUrl.host !== SUPER_RANDOM_HOST ? parsedUrl.host : 'unspecified-host'
    }
    this.path = parsedUrl.path
    this.queryParams = parsedUrl.params
  }

  private _parseCookieRows(): void {
    if (!this.cookiesRow) {
      return
    }

    const [cookieHeaderName, values] = splitBy(this.cookiesRow, ':')
    if (!cookieHeaderName) {
      throw HttpZError.get('Incorrect cookie row format, expected: Cookie: Name1=Value1;...', this.cookiesRow)
    }
    if (!values) {
      this.cookies = []
      return
    }

    this.cookies = values.split(';').map(pair => {
      const [name, value] = splitBy(pair, '=')
      const cookie: HttpZCookieParam = {
        name,
      }
      if (value) {
        cookie.value = value
      }
      if (!cookie.name) {
        throw HttpZError.get('Incorrect cookie pair format, expected: Name1=Value1;...', values)
      }
      return cookie
    })
  }

  private _generateModel(): HttpZParserRequestModel {
    const model: HttpZParserRequestModel = {
      method: this.method,
      protocolVersion: this.protocolVersion,
      target: this.target,
      host: this.host,
      path: this.path,
      headers: this.headers,
      headersSize: this.headersSize,
      bodySize: this.bodySize,
    }
    if (this.queryParams) {
      model.queryParams = this.queryParams
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
