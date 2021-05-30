const consts = require('../consts')
const validators = require('../validators')
const Base = require('./base')

class HttpZRequestBuilder extends Base {
  static build(model) {
    let instance = new HttpZRequestBuilder(model)
    return instance.build()
  }

  constructor({ method, protocolVersion, target, headers, body }) {
    super({ headers, body })
    this.method = method
    this.protocolVersion = protocolVersion
    this.target = target
  }

  build() {
    return '' +
      this._generateStartRow() +
      this._generateHeaderRows() +
      consts.EOL +
      this._generateBodyRows()
  }

  _generateStartRow() {
    validators.validateNotEmptyString(this.method, 'method')
    validators.validateNotEmptyString(this.protocolVersion, 'protocolVersion')
    validators.validateNotEmptyString(this.target, 'target')

    return '' +
      this.method.toUpperCase() + ' ' +
      this.target + ' ' +
      this.protocolVersion.toUpperCase() +
      consts.EOL
  }
}

module.exports = HttpZRequestBuilder
