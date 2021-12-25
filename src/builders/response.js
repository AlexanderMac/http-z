const consts = require('../consts')
const validators = require('../validators')
const Base = require('./base')

class HttpZResponseBuilder extends Base {
  static build(...params) {
    let instance = new HttpZResponseBuilder(...params)
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
    validators.validateNotEmptyString(this.protocolVersion, 'protocolVersion')
    validators.validatePositiveNumber(this.statusCode, 'statusCode')
    validators.validateNotEmptyString(this.statusMessage, 'statusMessage')

    let protocolVersion = this.protocolVersion.toUpperCase()
    return `${protocolVersion} ${this.statusCode} ${this.statusMessage}` + consts.EOL
  }
}

module.exports = HttpZResponseBuilder
