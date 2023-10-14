const _ = require('lodash')
const consts = require('../consts')
const HttpZError = require('../error')
const utils = require('../utils')
const Base = require('./base')

class HttpZResponseParser extends Base {
  static parse(...params) {
    let instance = new HttpZResponseParser(...params)
    return instance.parse()
  }

  parse() {
    this._parseMessageForRows()
    this._parseStartRow()
    this._parseHeaderRows()
    this._parseCookieRows()
    this._parseBodyRows()

    return this._generateModel()
  }

  _parseMessageForRows() {
    let { startRow, headerRows, bodyRows } = super._parseMessageForRows()

    this.startRow = startRow
    this.headerRows = headerRows
    this.cookieRows = _.filter(headerRows, row => _.chain(row).toLower().startsWith('set-cookie').value())
    this.bodyRows = bodyRows
  }

  _parseStartRow() {
    if (!consts.regexps.responseStartRow.test(this.startRow)) {
      throw HttpZError.get('Incorrect startRow format, expected: HTTP-Version status-code reason-phrase', this.startRow)
    }

    let rowElems = this.startRow.split(' ')
    this.protocolVersion = rowElems[0].toUpperCase()
    this.statusCode = +rowElems[1]
    this.statusMessage = rowElems.splice(2).join(' ')
  }

  _parseCookieRows() {
    if (_.isEmpty(this.cookieRows)) {
      return
    }

    // eslint-disable-next-line max-statements
    this.cookies = _.map(this.cookieRows, cookiesRow => {
      // eslint-disable-next-line no-unused-vars
      let [unused, values] = utils.splitByDelimiter(cookiesRow, ':')
      if (!values) {
        return {}
      }
      let params = _.split(values, ';')
      let paramWithName = _.head(params)
      let otherParams = _.tail(params)

      let [name, value] = _.split(paramWithName, '=')
      name = _.trim(name)
      value = _.trim(value)
      if (!name) {
        throw HttpZError.get('Incorrect set-cookie pair format, expected: Name1=Value1;...', values)
      }

      let cookie = {
        name
      }
      if (value) {
        cookie.value = value
      }
      if (otherParams.length > 0) {
        cookie.params = _.map(otherParams, p => _.trim(p))
      }

      return cookie
    })
  }

  _generateModel() {
    let model = {
      protocolVersion: this.protocolVersion,
      statusCode: this.statusCode,
      statusMessage: this.statusMessage,
      headersSize: this.headersSize,
      bodySize: this.bodySize
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

module.exports = HttpZResponseParser
