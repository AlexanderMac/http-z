'use strict';

const _          = require('lodash');
const consts     = require('../consts');
const utils      = require('../utils');
const validators = require('../validators');

class HttpZBaseBuilder {
  constructor({ headers, body }) {
    this.headers = headers;
    this.body = body;
  }

  _generateHeaderRows() {
    validators.validateArray(this.headers, 'headers');

    let headerRowsStr = _.chain(this.headers)
      .map((header, index) => {
        validators.validateRequired(header.name, 'header name', `header index: ${index}`);
        validators.validateArray(header.values, 'header.values', `header index: ${index}`);

        let headerValues = _.chain(header.values)
          .map(headerVal => {
            validators.validateRequired(headerVal.value, 'header.values.value', `header index: ${index}`);
            if (headerVal.params) {
              return headerVal.value + ';' + headerVal.params;
            }
            return headerVal.value;
          })
          .join(', ')
          .value();

        return utils.getHeaderName(header.name) + ': ' + headerValues;
      })
      .join('\n')
      .value();

    return headerRowsStr + '\n';
  }

  _generateBodyRows() {
    if (!this.body) {
      return '';
    }

    switch (this.body.contentType) {
      case consts.http.contentTypes.multipart.formData:
        return '\n' + this._generateFormDataBody();
      case consts.http.contentTypes.application.xWwwFormUrlencoded:
        return '\n' + this._generateXwwwFormUrlencodedBody();
      case consts.http.contentTypes.application.json:
        return '\n' + this._generateJsonBody();
      default:
        return '\n' + this._generatePlainBody();
    }
  }

  _generateFormDataBody() {
    validators.validateNotEmptyArray(this.body.formDataParams, 'body.formDataParams');
    validators.validateNotEmptyString(this.body.boundary, 'body.boundary');

    let formDataParamsStr = _.map(this.body.formDataParams, (dataParam, index) => {
      validators.validateNotEmptyString(dataParam.name, 'body.formDataParams[index].name', `dataParam index: ${index}`);
      return [
        '--' + this.body.boundary,
        '\n',
        `Content-Disposition: form-data; name="${dataParam.name}"`,
        '\n',
        '\n',
        utils.getEmptyStringForUndefined(dataParam.value),
        '\n'
      ].join('');
    }).join('');

    return `${formDataParamsStr}--${this.body.boundary}--`;
  }

  _generateXwwwFormUrlencodedBody() {
    validators.validateNotEmptyArray(this.body.formDataParams, 'body.formDataParams');

    let formDataParamsStr = _.map(this.body.formDataParams, (dataParam, index) => {
      validators.validateNotEmptyString(dataParam.name, 'body.formDataParams[index].name', `dataParam index: ${index}`);
      return dataParam.name + '=' + utils.getEmptyStringForUndefined(dataParam.value);
    }).join('&');

    return formDataParamsStr;
  }

  _generateJsonBody() {
    validators.validateRequired(this.body.json, 'body.json');
    return _.isString(this.body.json) ? this.body.json : JSON.stringify(this.body.json);
  }

  _generatePlainBody() {
    validators.validateRequired(this.body.plain, 'body.plain');
    return this.body.plain;
  }
}

module.exports = HttpZBaseBuilder;
