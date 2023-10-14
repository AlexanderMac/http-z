const _ = require('lodash')
const consts = require('../consts')
const validators = require('../validators')
const utils = require('../utils')
const HttpZError = require('../error')
const Base = require('./base')

class HttpZRequestBuilder extends Base {
  static build(...params) {
    let instance = new HttpZRequestBuilder(...params)
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
    validators.validateNotEmptyString(this.method, 'method')
    validators.validateNotEmptyString(this.protocolVersion, 'protocolVersion')
    validators.validateNotEmptyString(this.target, 'target')

    return '' + this.method.toUpperCase() + ' ' + this.target + ' ' + this.protocolVersion.toUpperCase() + consts.EOL
  }

  _generateHeaderRows() {
    validators.validateArray(this.headers, 'headers')
    if (this.opts.mandatoryHost) {
      let hostHeader = _.find(this.headers, name => utils.prettifyHeaderName(name) === consts.http.headers.host)
      if (!hostHeader) {
        throw HttpZError.get('Host header is required')
      }
    }

    return super._generateHeaderRows()
  }
}

module.exports = HttpZRequestBuilder
