const _ = require('lodash')
const consts = require('../consts')
const utils = require('../utils')
const validators = require('../validators')

class HttpZBaseBuilder {
  constructor({ headers, body }) {
    this.headers = headers
    this.body = body
  }

  _generateHeaderRows() {
    validators.validateArray(this.headers, 'headers')

    if (_.isEmpty(this.headers)) {
      return ''
    }

    let headerRowsStr = _.chain(this.headers)
      .map((header, index) => {
        validators.validateNotEmptyString(header.name, 'header name', `header index: ${index}`)
        validators.validateString(header.value, 'header.value', `header index: ${index}`)

        let headerName = utils.prettifyHeaderName(header.name)
        let headerValue = header.value

        return headerName + ': ' + headerValue
      })
      .join(consts.EOL)
      .value()

    return headerRowsStr + consts.EOL
  }

  _generateBodyRows() {
    if (_.isEmpty(this.body)) {
      return ''
    }

    this._processTransferEncodingChunked()

    switch (this.body.contentType) {
      case consts.http.contentTypes.multipart.formData:
      case consts.http.contentTypes.multipart.alternative:
      case consts.http.contentTypes.multipart.mixed:
      case consts.http.contentTypes.multipart.related:
        return this._generateFormDataBody()
      case consts.http.contentTypes.application.xWwwFormUrlencoded:
        return this._generateUrlencodedBody()
      default:
        return this._generateTextBody()
    }
  }

  _processTransferEncodingChunked() {
    const isChunked = this.headers.find(
      h => h.name === consts.http.headers.transferEncoding && h.value.includes('chunked')
    )
    if (!isChunked) {
      return
    }

    const body = utils.getEmptyStringForUndefined(this.body.text)
    const defChunkLength = 25
    const buffer = []
    let index = 0
    while (index < body.length) {
      const chunk = body.slice(index, index + defChunkLength)
      buffer.push(chunk.length.toString(16).toUpperCase())
      buffer.push(chunk)
      index += defChunkLength
    }
    this.body.text = buffer.join(consts.EOL)
  }

  _generateFormDataBody() {
    validators.validateArray(this.body.params, 'body.params')
    validators.validateNotEmptyString(this.body.boundary, 'body.boundary')

    if (_.isEmpty(this.body.params)) {
      return ''
    }

    // eslint-disable-next-line max-statements
    let paramsStr = _.map(this.body.params, (param, index) => {
      if (!param.type) {
        validators.validateNotEmptyString(param.name, 'body.params[index].name', `param index: ${index}`)
      }
      let paramGroupStr = '--' + this.body.boundary
      paramGroupStr += consts.EOL
      paramGroupStr += `Content-Disposition: ${param.type || 'form-data'}`
      if (param.name) {
        paramGroupStr += `; name="${param.name}"`
      }
      if (param.fileName) {
        paramGroupStr += `; filename="${param.fileName}"`
      }
      paramGroupStr += consts.EOL
      if (param.contentType) {
        paramGroupStr += `Content-Type: ${param.contentType}`
        paramGroupStr += consts.EOL
      }
      paramGroupStr += consts.EOL
      paramGroupStr += utils.getEmptyStringForUndefined(param.value)
      paramGroupStr += consts.EOL
      return paramGroupStr
    }).join('')

    return `${paramsStr}--${this.body.boundary}--`
  }

  _generateUrlencodedBody() {
    validators.validateArray(this.body.params, 'body.params')
    let paramPairs = utils.convertParamsArrayToPairs(this.body.params)

    return new URLSearchParams(paramPairs).toString()
  }

  _generateTextBody() {
    return utils.getEmptyStringForUndefined(this.body.text)
  }
}

module.exports = HttpZBaseBuilder
