const _ = require('lodash')
const consts = require('../consts')
const HttpZError = require('../error')
const utils = require('../utils')
const formDataParamParser = require('./form-data-param-parser')

class HttpZBaseParser {
  constructor(rawMessage) {
    this.rawMessage = rawMessage
  }

  _parseMessageForRows() {
    let [headers, body] = utils.splitByDelimiter(this.rawMessage, consts.EOL2X)
    if (_.isNil(headers) || _.isNil(body)) {
      throw HttpZError.get(
        'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]'
      )
    }

    this._calcSizes(headers, body)
    let headerRows = _.split(headers, consts.EOL)

    return {
      startRow: _.head(headerRows),
      headerRows: _.tail(headerRows),
      bodyRows: body
    }
  }

  _parseHeaderRows() {
    this.headers = _.map(this.headerRows, hRow => {
      let [name, value] = utils.splitByDelimiter(hRow, ':')
      if (!name) {
        throw HttpZError.get('Incorrect header row format, expected: Name: Value', hRow)
      }

      // quoted string must be parsed as a single value (https://tools.ietf.org/html/rfc7230#section-3.2.6)
      if (_.isNil(value)) {
        value = ''
      } else if (consts.regexps.quoutedHeaderValue.test(value)) {
        value = _.trim(value, '"')
      }

      return {
        name: utils.prettifyHeaderName(name),
        value
      }
    })
  }

  _parseBodyRows() {
    if (!this.bodyRows) {
      return
    }

    this._processTransferEncodingChunked()

    this.body = {}
    let contentTypeHeader = this._getContentTypeValue()
    if (contentTypeHeader) {
      this.body.contentType = contentTypeHeader.toLowerCase().split(';')[0]
    }
    switch (this.body.contentType) {
      case consts.http.contentTypes.multipart.formData:
      case consts.http.contentTypes.multipart.alternative:
      case consts.http.contentTypes.multipart.mixed:
      case consts.http.contentTypes.multipart.related:
        this._parseFormDataBody()
        break
      case consts.http.contentTypes.application.xWwwFormUrlencoded:
        this._parseUrlencodedBody()
        break
      default:
        this._parseTextBody()
        break
    }
  }

  // eslint-disable-next-line max-statements
  _processTransferEncodingChunked() {
    const isChunked = this.headers.find(
      h => h.name === consts.http.headers.transferEncoding && h.value.includes('chunked')
    )
    if (!isChunked) {
      return
    }

    let text = this.bodyRows
    const buffer = []
    do {
      const rows = text.match(consts.regexps.chunkRow)
      const firstRow = rows ? rows[0] : ''
      const chunkLength = +('0x' + firstRow || '').trim()
      if (!chunkLength) {
        throw HttpZError.get('Incorrect row, expected: NumberEOL', this.bodyRows)
      }
      text = text.slice(firstRow.length)
      const chunk = text.slice(0, chunkLength)
      buffer.push(chunk)
      text = text.slice(chunkLength + consts.EOL.length)
    } while (text)

    this.bodyRows = buffer.join('')
  }

  _parseFormDataBody() {
    this.body.boundary = this._getBoundary()
    this.body.params = _.chain(this.bodyRows)
      .split(`--${this.body.boundary}`)
      // skip first and last items, which contains boundary
      .filter((unused, index, params) => index > 0 && index < params.length - 1)
      .map(paramGroup => formDataParamParser.parse(paramGroup))
      .value()
  }

  _parseUrlencodedBody() {
    let params = new URLSearchParams(this.bodyRows)
    this.body.params = []
    params.forEach((value, name) => {
      this.body.params.push({ name, value })
    })
  }

  _parseTextBody() {
    this.body.text = this.bodyRows
  }

  _calcSizes(headers, body) {
    this.headersSize = (headers + consts.EOL2X).length
    this.bodySize = body.length
  }

  _getContentTypeValue() {
    let contentTypeHeader = _.find(this.headers, { name: consts.http.headers.contentType })
    if (!contentTypeHeader) {
      return
    }
    if (!contentTypeHeader.value) {
      return
    }
    return contentTypeHeader.value
  }

  _getBoundary() {
    let contentTypeValue = this._getContentTypeValue()
    if (!contentTypeValue) {
      throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary')
    }

    let params = contentTypeValue.split(';')[1]
    if (!params) {
      throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary')
    }

    let boundary = params.match(consts.regexps.boundary)
    if (!boundary) {
      throw HttpZError.get('Incorrect boundary, expected: boundary=value', params)
    }
    return _.trim(boundary[0], '"')
  }
}

module.exports = HttpZBaseParser
