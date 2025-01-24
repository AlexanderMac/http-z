const consts = require('../consts')
const HttpZError = require('../error')
const { splitByDelimiter, head, tail, isEmpty } = require('../utils')
const Base = require('./base')

class HttpZResponseParser extends Base {
  static parse(...params) {
    const instance = new HttpZResponseParser(...params)
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
    const { startRow, headerRows, bodyRows } = super._parseMessageForRows()

    this.startRow = startRow
    this.headerRows = headerRows
    this.cookieRows = headerRows.filter((row) => row.toLowerCase().startsWith('set-cookie'))
    this.bodyRows = bodyRows
  }

  _parseStartRow() {
    if (!consts.regexps.responseStartRow.test(this.startRow)) {
      throw HttpZError.get('Incorrect startRow format, expected: HTTP-Version status-code reason-phrase', this.startRow)
    }

    const rowElems = this.startRow.split(' ')
    this.protocolVersion = rowElems[0].toUpperCase()
    this.statusCode = +rowElems[1]
    this.statusMessage = rowElems.splice(2).join(' ')
  }

  _parseCookieRows() {
    if (isEmpty(this.cookieRows)) {
      return
    }

    // eslint-disable-next-line max-statements
    this.cookies = this.cookieRows.map((cookiesRow) => {
      // eslint-disable-next-line no-unused-vars
      const [unused, values] = splitByDelimiter(cookiesRow, ':')
      if (!values) {
        return {}
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

      const cookie = {
        name,
      }
      if (value) {
        cookie.value = value
      }
      if (otherParams.length > 0) {
        cookie.params = otherParams.map((param) => param.trim())
      }

      return cookie
    })
  }

  _generateModel() {
    const model = {
      protocolVersion: this.protocolVersion,
      statusCode: this.statusCode,
      statusMessage: this.statusMessage,
      headersSize: this.headersSize,
      bodySize: this.bodySize,
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
