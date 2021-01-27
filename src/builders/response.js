const _ = require('lodash')
const consts = require('../consts')
const validators = require('../validators')
const Base = require('./base')

class HttpZResponseBuilder extends Base {
  static build(model) {
    let instance = new HttpZResponseBuilder(model)
    return instance.build()
  }

  constructor({ protocolVersion, statusCode, statusMessage, headers, body, cookies }) {
    super({ headers, body })
    this.protocolVersion = protocolVersion
    this.statusCode = statusCode
    this.statusMessage = statusMessage
    this.cookies = cookies
  }

  build() {
    return '' +
      this._generateStartRow() +
      this._generateHeaderRows() +
      this._generateCookieRows() +
      consts.EOL +
      this._generateBodyRows()
  }

  _generateStartRow() {
    validators.validateNotEmptyString(this.protocolVersion, 'protocolVersion')
    validators.validatePositiveNumber(this.statusCode, 'statusCode')
    validators.validateNotEmptyString(this.statusMessage, 'statusMessage')

    let protocolVersion = this.protocolVersion.toUpperCase()
    return `${protocolVersion} ${this.statusCode} ${this.statusMessage}` + consts.EOL
  }

  _generateHeaderRows() {
    validators.validateArray(this.headers, 'headers')

    _.remove(this.headers, h => {
      let hName = _.toLower(h.name)
      return hName === 'set-cookie'
    })

    return super._generateHeaderRows()
  }

  _generateCookieRows() {
    if (_.isEmpty(this.cookies)) {
      return ''
    }

    validators.validateArray(this.cookies, 'cookies')

    if (_.isEmpty(this.cookies)) {
      return ''
    }

    let cookieRowsStr = _.chain(this.cookies)
      .map(({ name, value, params }, index) => {
        validators.validateNotEmptyString(name, 'cookie name', `cookie index: ${index}`)
        let paramsStr = ''
        if (params) {
          validators.validateArray(params, 'cookie params', `cookie index: ${index}`)
          paramsStr = '; ' + params.join('; ')
        }
        return `Set-Cookie: ${name}=${value || ''}` + paramsStr
      })
      .join(consts.EOL)
      .value()

    return cookieRowsStr + consts.EOL
  }
}

module.exports = HttpZResponseBuilder
