const consts = require('../consts')
const { assertNotEmptyString, assertPositiveNumber } = require('../assertions')
const Base = require('./base')

class HttpZResponseBuilder extends Base {
  static build(...params) {
    const instance = new HttpZResponseBuilder(...params)
    return instance.build()
  }

  constructor({ protocolVersion, statusCode, statusMessage, headers, body }) {
    super({ headers, body })
    this.protocolVersion = protocolVersion
    this.statusCode = statusCode
    this.statusMessage = statusMessage
  }

  build() {
    return '' + this._generateStartRow() + this._generateHeaderRows() + consts.EOL + this._generateBodyRows()
  }

  _generateStartRow() {
    assertNotEmptyString(this.protocolVersion, 'protocolVersion')
    assertPositiveNumber(this.statusCode, 'statusCode')
    assertNotEmptyString(this.statusMessage, 'statusMessage')

    const protocolVersion = this.protocolVersion.toUpperCase()
    return `${protocolVersion} ${this.statusCode} ${this.statusMessage}` + consts.EOL
  }
}

module.exports = HttpZResponseBuilder
