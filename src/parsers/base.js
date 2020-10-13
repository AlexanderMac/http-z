const _ = require('lodash')
const qs = require('querystring')
const consts = require('../consts')
const HttpZError = require('../error')
const utils = require('../utils')
const formDataParamParser = require('./form-data-param-parser')

class HttpZBaseParser {
  constructor(plainMessage) {
    this.plainMessage = plainMessage
  }

  _parseMessageForRows() {
    let [headers, body] = utils.splitByDelimeter(this.plainMessage, consts.EOL2X)
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
      let [name, values] = utils.splitByDelimeter(hRow, ':')
      if (!name) {
        throw HttpZError.get('Incorrect header row format, expected: Name: Values', hRow)
      }

      let valuesWithParams
      if (_.isNil(values) || values === '') {
        valuesWithParams = []
      // quoted string must be parsed as a single value (https://tools.ietf.org/html/rfc7230#section-3.2.6)
      } else if (consts.regexps.quoutedHeaderValue.test(values)) {
        valuesWithParams = [{ value: _.trim(values, '"') }]
      } else if (_.toLower(name) === consts.http.headers.userAgent.toLowerCase()) { // use 'user-agent' as is
        valuesWithParams = [{ value: values }]
      } else {
        valuesWithParams = _.chain(values)
          .split(',')
          .map(value => {
            let valueAndParams = _.split(value, ';')
            let res = {
              value: _.trim(valueAndParams[0])
            }
            if (valueAndParams.length > 1) {
              res.params = _.trim(valueAndParams[1])
            }
            return res
          })
          .value()
      }

      return {
        name: utils.pretifyHeaderName(name),
        values: valuesWithParams
      }
    })
  }

  _parseBodyRows() {
    if (!this.bodyRows) {
      return
    }

    this.body = {}
    this.body.contentType = this._getContentTypeValue()
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
    let params = qs.parse(this.bodyRows)
    this.body.params = _.map(params, (value, name) => ({ name, value }))
  }

  _parseTextBody() {
    this.body.text = this.bodyRows
  }

  _calcSizes(headers, body) {
    this.headersSize = (headers + consts.EOL2X).length
    this.bodySize = body.length
  }

  _getContentTypeObject() {
    return _.chain(this.headers)
      .find({ name: consts.http.headers.contentType })
      .get('values[0]')
      .value()
  }

  _getContentTypeValue() {
    let contentTypeHeader = this._getContentTypeObject()
    if (!contentTypeHeader) {
      return
    }
    if (!contentTypeHeader.value) {
      return
    }
    return contentTypeHeader.value.toLowerCase()
  }

  _getBoundary() {
    let contentTypeHeader = this._getContentTypeObject()
    if (!contentTypeHeader || !contentTypeHeader.params) {
      throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary')
    }

    let boundary = contentTypeHeader.params.match(consts.regexps.boundary)
    if (!boundary) {
      throw HttpZError.get('Incorrect boundary, expected: boundary=value', contentTypeHeader.params)
    }
    return _.trim(boundary[0], '"')
  }
}

module.exports = HttpZBaseParser
