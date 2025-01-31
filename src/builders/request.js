const consts = require('../consts')
const { assertArray, assertNotEmptyString } = require('../assertions')
const { prettifyHeaderName } = require('../utils')
const HttpZError = require('../error')
const Base = require('./base')

class HttpZRequestBuilder extends Base {
  static build(...params) {
    const instance = new HttpZRequestBuilder(...params)
    return instance.build()
  }

  constructor({ method, protocolVersion, target, headers, body }, opts) {
    super({ headers, body })
    this.method = method
    this.protocolVersion = protocolVersion
    this.target = target
    this.opts = opts
  }

  build() {
    return '' + this._generateStartRow() + this._generateHeaderRows() + consts.EOL + this._generateBodyRows()
  }

  _generateStartRow() {
    assertNotEmptyString(this.method, 'method')
    assertNotEmptyString(this.protocolVersion, 'protocolVersion')
    assertNotEmptyString(this.target, 'target')

    return '' + this.method.toUpperCase() + ' ' + this.target + ' ' + this.protocolVersion.toUpperCase() + consts.EOL
  }

  _generateHeaderRows() {
    assertArray(this.headers, 'headers')
    if (this.opts.mandatoryHost) {
      const hostHeader = this.headers.find((name) => prettifyHeaderName(name) === consts.http.headers.host)
      if (!hostHeader) {
        throw HttpZError.get('Host header is required')
      }
    }

    return super._generateHeaderRows()
  }
}

module.exports = HttpZRequestBuilder
