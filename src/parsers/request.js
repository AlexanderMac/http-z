const consts = require('../consts')
const HttpZError = require('../error')
const { splitBy, parseUrl } = require('../utils')
const { assertNotEmptyString } = require('../assertions')
const Base = require('./base')

const SUPER_RANDOM_HOST = 'superrandomhost28476561927456.com'

class HttpZRequestParser extends Base {
  static parse(...params) {
    const instance = new HttpZRequestParser(...params)
    return instance.parse()
  }

  constructor(rawMessage, opts) {
    super(rawMessage)
    this.opts = opts
  }

  parse() {
    this._parseMessageForRows()
    this._parseHostRow()
    this._parseStartRow()
    this._parseHeaderRows()
    this._parseCookiesRow()
    this._parseBodyRows()

    return this._generateModel()
  }

  _parseMessageForRows() {
    const { startRow, headerRows, bodyRows } = super._parseMessageForRows()

    this.startRow = startRow
    this.hostRow = headerRows.find((row) => row.toLowerCase().startsWith('host:'))
    this.headerRows = headerRows
    this.cookiesRow = headerRows.find((row) => row.toLowerCase().startsWith('cookie:'))
    this.bodyRows = bodyRows
  }

  _parseHostRow() {
    if (this.opts.mandatoryHost) {
      assertNotEmptyString(this.hostRow, 'host header')
    }
    // eslint-disable-next-line no-unused-vars
    const [unused, value] = splitBy(this.hostRow || '', ':')
    if (this.opts.mandatoryHost) {
      assertNotEmptyString(value, 'host header value')
    }

    this.host = value
  }

  // eslint-disable-next-line max-statements
  _parseStartRow() {
    if (!consts.regexps.requestStartRow.test(this.startRow)) {
      throw HttpZError.get('Incorrect startRow format, expected: Method request-target HTTP-Version', this.startRow)
    }

    const rowElems = this.startRow.split(' ')
    this.method = rowElems[0].toUpperCase()
    this.protocolVersion = rowElems[2].toUpperCase()
    this.target = rowElems[1]

    let parsedUrl
    try {
      parsedUrl = parseUrl(this.target, SUPER_RANDOM_HOST)
    } catch (err) {
      if (err.code === 'ERR_INVALID_URL') {
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

  _parseCookiesRow() {
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
    this.cookies = values.split(';').map((pair) => {
      const [name, value] = splitBy(pair, '=')
      const cookie = {
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

  _generateModel() {
    const model = {
      method: this.method,
      protocolVersion: this.protocolVersion,
      target: this.target,
      host: this.host,
      path: this.path,
      headersSize: this.headersSize,
      bodySize: this.bodySize,
    }
    if (this.queryParams) {
      model.queryParams = this.queryParams
    }
    if (this.headers) {
      model.headers = this.headers
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

module.exports = HttpZRequestParser
