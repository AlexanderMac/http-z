const _ = require('lodash');
const qs = require('querystring');
const consts = require('../consts');
const utils = require('../utils');
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

        let headerName = utils.capitalizeHeaderName(header.name);
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

        return headerName + ': ' + headerValues;
      })
      .join(consts.eol)
      .value();

    return headerRowsStr + consts.eol;
  }

  _generateBodyRows() {
    if (!this.body) {
      return '';
    }

    switch (this.body.contentType) {
      case consts.http.contentTypes.multipart.formData:
      case consts.http.contentTypes.multipart.alternative:
      case consts.http.contentTypes.multipart.mixed:
      case consts.http.contentTypes.multipart.related:
        return consts.eol + this._generateFormDataBody();
      case consts.http.contentTypes.application.xWwwFormUrlencoded:
        return consts.eol + this._generateXwwwFormUrlencodedBody();
      default:
        return consts.eol + this._generateTextBody();
    }
  }

  _generateFormDataBody() {
    validators.validateArray(this.body.params, 'body.params');
    validators.validateNotEmptyString(this.body.boundary, 'body.boundary');

    // eslint-disable-next-line max-statements
    let paramsStr = _.map(this.body.params, (param, index) => {
      if (!param.type) {
        validators.validateNotEmptyString(param.name, 'body.params[index].name', `param index: ${index}`);
      }
      let paramGroupStr = '--' + this.body.boundary;
      paramGroupStr += consts.eol;
      paramGroupStr += `Content-Disposition: ${param.type || 'form-data'}`;
      if (param.name) {
        paramGroupStr += `; name="${param.name}"`;
      }
      if (param.fileName) {
        paramGroupStr += `; filename="${param.fileName}"`;
      }
      paramGroupStr += consts.eol;
      if (param.contentType) {
        paramGroupStr += `Content-Type: ${param.contentType}`;
        paramGroupStr += consts.eol;
      }
      paramGroupStr += consts.eol;
      paramGroupStr += utils.getEmptyStringForUndefined(param.value);
      paramGroupStr += consts.eol;
      return paramGroupStr;
    }).join('');

    return `${paramsStr}--${this.body.boundary}--`;
  }

  _generateXwwwFormUrlencodedBody() {
    validators.validateArray(this.body.params, 'body.params');

    let params = _.reduce(this.body.params, (result, dataParam, index) => {
      validators.validateNotEmptyString(dataParam.name, 'body.params[index].name', `dataParam index: ${index}`);
      result[dataParam.name] = utils.getEmptyStringForUndefined(dataParam.value);
      return result;
    }, {});

    return qs.stringify(params);
  }

  _generateTextBody() {
    validators.validateRequired(this.body.text, 'body.text');
    return this.body.text;
  }
}

module.exports = HttpZBaseBuilder;
