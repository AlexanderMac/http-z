const _ = require('lodash');
const consts = require('../consts');
const utils = require('../utils');
const HttpZError = require('../error');

class FormDataParamParser {
  static parse(...params) {
    let instance = new FormDataParamParser(...params);
    return instance.parse();
  }

  constructor(paramGroup) {
    this.paramGroup = paramGroup;
  }

  parse() {
    this.paramGroup = this.paramGroup
      .replace(consts.regexps.startNl, '')
      .replace(consts.regexps.endNl, '');

    let contentDispositionHeader = this._getContentDisposition();
    let contentType = this._getContentType();
    let dispositionType = this._getDispositionType(contentDispositionHeader);
    let name = dispositionType === 'form-data' ? this._getParamName(contentDispositionHeader) : undefined;
    let fileName = this._getFileName(contentDispositionHeader);
    let value = this._getParamValue();

    let param = {
      value
    };
    if (dispositionType !== 'form-data') {
      param.type = dispositionType;
    }
    utils.extendIfNotUndefined(param, 'contentType', contentType);
    utils.extendIfNotUndefined(param, 'name', name);
    utils.extendIfNotUndefined(param, 'fileName', fileName);

    return param;
  }

  _getContentDisposition() {
    let contentDisposition = this.paramGroup.match(consts.regexps.contentDisposition);
    if (!contentDisposition) {
      throw HttpZError.get('Incorrect Content-Disposition', this.paramGroup);
    }
    this.paramGroup = this.paramGroup.replace(contentDisposition[0], '');
    contentDisposition = _.trimEnd(contentDisposition[0], consts.EOL);
    return contentDisposition;
  }

  _getContentType() {
    let contentType = this.paramGroup.match(consts.regexps.contentType);
    if (contentType) {
      this.paramGroup = this.paramGroup.replace(contentType[0], '');
      return _.chain(contentType)
        .toLower()
        .replace(/^content-type: */, '')
        .trimEnd(consts.EOL)
        .value();
    }
  }

  _getDispositionType(contentDisposition) {
    let dispositionType = contentDisposition.match(consts.regexps.contentDispositionType);
    if (!dispositionType) {
      throw HttpZError.get('Incorrect Content-Disposition type', contentDisposition);
    }
    dispositionType = _.chain(dispositionType[0]).trim().toLower().value();
    return dispositionType;
  }

  _getParamName(contentDisposition) {
    let paramName = contentDisposition.match(consts.regexps.dispositionName);
    if (!paramName) {
      throw HttpZError.get('Incorrect Content-Disposition, expected param name', contentDisposition);
    }
    paramName = _.trim(paramName, '"');
    return paramName;
  }

  _getFileName(contentDisposition) {
    let fileName = contentDisposition.match(consts.regexps.dispositionFileName);
    if (fileName) {
      return _.trim(fileName, '"');
    }
  }

  _getParamValue() {
    let value;
    if (this.paramGroup.match(consts.regexps.startNl)) {
      value = this.paramGroup.replace(consts.regexps.startNl, '');
    } else {
      throw HttpZError.get('Incorrect form-data parameter', this.paramGroup);
    }
    return value;
  }
}

module.exports = FormDataParamParser;
