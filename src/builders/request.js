const _ = require('lodash')
const consts = require('../consts')
const utils = require('../utils')
const validators = require('../validators')
const Base = require('./base')

class HttpZRequestBuilder extends Base {
  static build(model) {
    let instance = new HttpZRequestBuilder(model)
    return instance.build()
  }

  constructor({ method, protocolVersion, target, headers, cookies, body }) {
    super({ headers, body })
    this.method = method
    this.protocolVersion = protocolVersion
    this.target = target
    this.cookies = cookies
  }

  build() {
    return '' +
      this._generateStartRow() +
      this._generateHeaderRows() +
      this._generateCookiesRow() +
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

  _generateHeaderRows() {
    validators.validateArray(this.headers, 'headers')

    _.remove(this.headers, h => {
      let hName = _.toLower(h.name)
      return hName === 'cookie'
    })

    return super._generateHeaderRows()
  }

  _generateCookiesRow() {
    if (_.isEmpty(this.cookies)) {
      return ''
    }

    validators.validateArray(this.cookies, 'cookies')

    let cookiesStr = _.map(this.cookies, ({ name, value }, index) => {
      validators.validateNotEmptyString(name, 'cookie name', `cookie index: ${index}`)
      return name + '=' + (value || '')
    })

    return 'Cookie: ' + cookiesStr.join('; ') + consts.EOL
  }
}

module.exports = HttpZRequestBuilder
