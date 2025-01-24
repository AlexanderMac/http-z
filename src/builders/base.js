const { isEmpty } = require('../utils')
const consts = require('../consts')
const { prettifyHeaderName, getEmptyStringForUndefined, arrayToPairs } = require('../utils')
const { assertArray, assertNotEmptyString, assertString } = require('../assertions')

class HttpZBaseBuilder {
  constructor({ headers, body }) {
    this.headers = headers
    this.body = body
  }

  _generateHeaderRows() {
    assertArray(this.headers, 'headers')

    if (isEmpty(this.headers)) {
      return ''
    }

    const headerRowsStr = this.headers
      .map((header, index) => {
        assertNotEmptyString(header.name, 'header name', `header index: ${index}`)
        assertString(header.value, 'header.value', `header index: ${index}`)

        const headerName = prettifyHeaderName(header.name)
        const headerValue = header.value

        return headerName + ': ' + headerValue
      })
      .join(consts.EOL)

    return headerRowsStr + consts.EOL
  }

  _generateBodyRows() {
    if (isEmpty(this.body)) {
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
      (h) => h.name === consts.http.headers.transferEncoding && h.value.includes('chunked'),
    )
    if (!isChunked) {
      return
    }

    const body = getEmptyStringForUndefined(this.body.text)
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
    assertArray(this.body.params, 'body.params')
    assertNotEmptyString(this.body.boundary, 'body.boundary')

    if (isEmpty(this.body.params)) {
      return ''
    }

    const paramsStr = this.body.params
      // eslint-disable-next-line max-statements
      .map((param, index) => {
        if (!param.type) {
          assertNotEmptyString(param.name, 'body.params[index].name', `param index: ${index}`)
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
        paramGroupStr += getEmptyStringForUndefined(param.value)
        paramGroupStr += consts.EOL
        return paramGroupStr
      })
      .join('')

    return `${paramsStr}--${this.body.boundary}--`
  }

  _generateUrlencodedBody() {
    assertArray(this.body.params, 'body.params')
    const paramPairs = arrayToPairs(this.body.params)

    return new URLSearchParams(paramPairs).toString()
  }

  _generateTextBody() {
    return getEmptyStringForUndefined(this.body.text)
  }
}

module.exports = HttpZBaseBuilder
