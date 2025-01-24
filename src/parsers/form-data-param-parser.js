const consts = require('../consts')
const { extendIfNotUndefined, trim, trimEnd } = require('../utils')
const HttpZError = require('../error')

class FormDataParamParser {
  // TODO: test it
  static parse(...params) {
    const instance = new FormDataParamParser(...params)
    return instance.parse()
  }

  constructor(paramGroup) {
    this.paramGroup = paramGroup
  }

  // TODO: test it
  parse() {
    this.paramGroup = this.paramGroup.replace(consts.regexps.startNl, '').replace(consts.regexps.endNl, '')

    const contentDispositionHeader = this._getContentDisposition()
    const contentType = this._getContentType()
    const dispositionType = this._getDispositionType(contentDispositionHeader)
    const name = dispositionType === 'form-data' ? this._getParamName(contentDispositionHeader) : undefined
    const fileName = this._getFileName(contentDispositionHeader)
    const value = this._getParamValue()

    const param = {
      value,
    }
    if (dispositionType !== 'form-data') {
      param.type = dispositionType
    }
    extendIfNotUndefined(param, 'contentType', contentType)
    extendIfNotUndefined(param, 'name', name)
    extendIfNotUndefined(param, 'fileName', fileName)

    return param
  }

  // TODO: test it
  _getContentDisposition() {
    const contentDisposition = this.paramGroup.match(consts.regexps.contentDisposition)
    if (!contentDisposition) {
      throw HttpZError.get('Incorrect Content-Disposition', this.paramGroup)
    }
    this.paramGroup = this.paramGroup.replace(contentDisposition[0], '')
    return trimEnd(contentDisposition[0], consts.EOL)
  }

  // TODO: test it
  _getContentType() {
    const contentType = this.paramGroup.match(consts.regexps.contentType)
    if (contentType) {
      this.paramGroup = this.paramGroup.replace(contentType[0], '')
      return contentType
        .toString()
        .toLowerCase()
        .replace(/^content-type: */, '')
        .trimEnd(consts.EOL)
    }
  }

  // TODO: test it
  _getDispositionType(contentDisposition) {
    const dispositionType = contentDisposition.match(consts.regexps.contentDispositionType)
    if (!dispositionType) {
      throw HttpZError.get('Incorrect Content-Disposition type', contentDisposition)
    }
    return dispositionType[0].trim().toLowerCase()
  }

  // TODO: test it
  _getParamName(contentDisposition) {
    const paramName = contentDisposition.match(consts.regexps.dispositionName)
    if (!paramName) {
      throw HttpZError.get('Incorrect Content-Disposition, expected param name', contentDisposition)
    }
    return trim(paramName, '"')
  }

  // TODO: test it
  _getFileName(contentDisposition) {
    const fileName = contentDisposition.match(consts.regexps.dispositionFileName)
    if (fileName) {
      return trim(fileName, '"')
    }
  }

  // TODO: test it
  _getParamValue() {
    if (this.paramGroup.match(consts.regexps.startNl)) {
      return this.paramGroup.replace(consts.regexps.startNl, '')
    }
    throw HttpZError.get('Incorrect form-data parameter', this.paramGroup)
  }
}

module.exports = FormDataParamParser
