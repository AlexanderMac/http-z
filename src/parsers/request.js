const _ = require('lodash')
const consts = require('../consts')
const HttpZError = require('../error')
const utils = require('../utils')
const validators = require('../validators')
const Base = require('./base')

const SOME_RANDOM_HOST = 'somerandomhost28476561927456.com'

class HttpZRequestParser extends Base {
  static parse(...params) {
    let instance = new HttpZRequestParser(...params)
    return instance.parse()
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
    this.cookiesRow = _.find(headerRows, row => _.chain(row).toLower().startsWith('cookie:').value())
    this.headerRows = _.without(headerRows, this.cookiesRow)
    this.bodyRows = bodyRows
  }

  _parseHostRow() {
    validators.validateNotEmptyString(this.hostRow, 'host header')
    // eslint-disable-next-line no-unused-vars
    let [unused, value] = utils.splitByDelimeter(this.hostRow, ':')
    validators.validateNotEmptyString(value, 'host header value')

    this.host = value
  }

  // eslint-disable-next-line max-statements
  _parseStartRow() {
    if (!consts.regexps.requestStartRow.test(this.startRow)) {
      throw HttpZError.get(
        'Incorrect startRow format, expected: Method request-target HTTP-Version',
        this.startRow
      )
    }

    let rowElems = this.startRow.split(' ')
    this.method = rowElems[0].toUpperCase()
    this.protocolVersion = rowElems[2].toUpperCase()
    this.target = rowElems[1]

    let host
    if (utils.isAbsoluteUrl(this.target)) {
      host = null
    } else if (this.host) {
      host = this.host
    } else {
      // SOME_RANDOM_HOST is used here for generating URL only
      host = SOME_RANDOM_HOST
    }

    let parsedUrl = _.attempt(utils.parseUrl.bind(null, this.target, host))
    if (_.isError(parsedUrl)) {
      throw HttpZError.get('Invalid target or host header', this.target)
    }

    this.host = parsedUrl.host !== SOME_RANDOM_HOST ? parsedUrl.host : 'unspecified-host'
    this.path = parsedUrl.path
    this.queryParams = parsedUrl.params
  }

  _parseCookiesRow() {
    if (!this.cookiesRow) {
      return
    }

    let [cookieHeaderName, values] = utils.splitByDelimeter(this.cookiesRow, ':')
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
        let [name, value] = utils.splitByDelimeter(pair, '=')
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
