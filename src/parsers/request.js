const _ = require('lodash')
const consts = require('../consts')
const HttpZError = require('../error')
const utils = require('../utils')
const validators = require('../validators')
const Base = require('./base')

const SUPER_RANDOM_HOST = 'superrandomhost28476561927456.com'

class HttpZRequestParser extends Base {
  static parse(...params) {
    let instance = new HttpZRequestParser(...params)
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
    let { startRow, headerRows, bodyRows } = super._parseMessageForRows()

    this.startRow = startRow
    this.hostRow = _.find(headerRows, row => _.chain(row).toLower().startsWith('host:').value())
    this.headerRows = headerRows
    this.cookiesRow = _.find(headerRows, row => _.chain(row).toLower().startsWith('cookie:').value())
    this.bodyRows = bodyRows
  }

  _parseHostRow() {
    if (this.opts.mandatoryHost) {
      validators.validateNotEmptyString(this.hostRow, 'host header')
    }
    // eslint-disable-next-line no-unused-vars
    let [unused, value] = utils.splitByDelimiter(this.hostRow || '', ':')
    if (this.opts.mandatoryHost) {
      validators.validateNotEmptyString(value, 'host header value')
    }

    this.host = value
  }

  _parseStartRow() {
    if (!consts.regexps.requestStartRow.test(this.startRow)) {
      throw HttpZError.get('Incorrect startRow format, expected: Method request-target HTTP-Version', this.startRow)
    }

    let rowElems = this.startRow.split(' ')
    this.method = rowElems[0].toUpperCase()
    this.protocolVersion = rowElems[2].toUpperCase()
    this.target = rowElems[1]

    let parsedUrl = _.attempt(utils.parseUrl.bind(null, this.target, SUPER_RANDOM_HOST))
    if (_.isError(parsedUrl)) {
      throw HttpZError.get('Invalid target', this.target)
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

    let [cookieHeaderName, values] = utils.splitByDelimiter(this.cookiesRow, ':')
    if (!cookieHeaderName) {
      throw HttpZError.get('Incorrect cookie row format, expected: Cookie: Name1=Value1;...', this.cookiesRow)
    }
    if (!values) {
      this.cookies = []
      return
    }
    this.cookies = _.chain(values)
      .split(';')
      .map(pair => {
        let [name, value] = utils.splitByDelimiter(pair, '=')
        let cookie = {
          name
        }
        if (value) {
          cookie.value = value
        }
        if (!cookie.name) {
          throw HttpZError.get('Incorrect cookie pair format, expected: Name1=Value1;...', values)
        }
        return cookie
      })
      .value()
  }

  _generateModel() {
    let model = {
      method: this.method,
      protocolVersion: this.protocolVersion,
      target: this.target,
      host: this.host,
      path: this.path,
      headersSize: this.headersSize,
      bodySize: this.bodySize
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
