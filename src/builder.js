'use strict';

const _      = require('lodash');
const consts = require('./consts');
const utils  = require('./utils');

class HttpZBuilder {
  static build(params) {
    let instance = new HttpZBuilder(params);
    return instance.build();
  }

  constructor({ method, url, protocol, protocolVersion, headers, cookies, body }) {
    this.method = method;
    this.url = url;
    this.protocol = protocol;
    this.protocolVersion = protocolVersion;
    this.headers = headers;
    this.cookies = cookies;
    this.body = body;
  }

  build() {
    return '' +
      this._generateStartRow() +
      this._generateHostRow() +
      this._generateHeaderRows() +
      this._generateCookieRows() +
      this._generateBodyRows();
  }

  _generateStartRow() {
    if (!this.method) {
      throw utils.getErrorMessage('Method must be defined');
    }
    if (!this.url) {
      throw utils.getErrorMessage('Url must be defined');
    }
    if (!this.protocol) {
      throw utils.getErrorMessage('Protocol must be defined');
    }
    if (!this.protocolVersion) {
      throw utils.getErrorMessage('ProtocolVersion must be defined');
    }

    let protocol = _.toLower(this.protocol);
    let url = _.trimStart(this.url, '/');
    return `${this.method} ${protocol}://${url} ${this.protocolVersion}\n`;
  }

  _generateHostRow() {
    let host = this._getHostName();
    return `HOST: ${host}\n`;
  }

  _generateHeaderRows() {
    if (!this.headers || !_.isArray(this.headers) || this.headers.length === 0) {
      throw utils.getErrorMessage('Headers must be not empty array');
    }

    let headerRows = _.map(this.headers, (header) => {
      if (!header.name) {
        throw utils.getErrorMessage('Header name must be defined', JSON.stringify(header));
      }
      if (!header.values || !_.isArray(header.values) || header.values.length === 0) {
        throw utils.getErrorMessage('Header values must be defined', JSON.stringify(header));
      }

      let hvsStr = _.map(header.values, (headerValue) => {
        let hvStr = headerValue.value;
        if (!hvStr) {
          throw utils.getErrorMessage('Header value must be defined', JSON.stringify(header));
        }
        if (headerValue.params) {
          hvStr += ';' + headerValue.params;
        }
        return hvStr;
      });

      return header.name + ': ' + hvsStr.join(', ');
    });

    return headerRows.join('\n') + '\n';
  }

  _generateCookieRows() {
    if (!this.cookies) {
      return '';
    }

    if (!_.isArray(this.cookies) || this.cookies.length === 0) {
      throw utils.getErrorMessage('Cookies must be not empty array');
    }

    let cookiesStr = _.map(this.cookies, (nameValuePair) => {
      if (!nameValuePair.name || !nameValuePair.value) {
        throw utils.getErrorMessage('Cookie name or value must be defined', JSON.stringify(nameValuePair));
      }
      return nameValuePair.name + '=' + nameValuePair.value;
    });

    return 'Cookie: ' + cookiesStr.join('; ') + '\n';
  }

  _generateBodyRows() {
    if (!this.body) {
      return '\n';
    }

    switch (this.body.contentType) {
      case consts.http.contentTypes.formData:
        return '\n' + this._buildFormDataBody();
      case consts.http.contentTypes.xWwwFormUrlencoded:
        return '\n' + this._buildXwwwFormUrlencodedBody();
      case consts.http.contentTypes.json:
        return '\n' + JSON.stringify(this.body.json);
      default:
        return '\n' + this.body.plain;
    }
  }

  _buildFormDataBody() {
    if (!this.body.boundary) {
      throw utils.getErrorMessage('Body with ContentType=multipart/form-data must have boundary');
    }
    if (!this.body.formDataParams || !_.isArray(this.body.formDataParams) || this.body.formDataParams.length === 0) {
      throw utils.getErrorMessage('Body with ContentType=multipart/form-data must have parameters');
    }

    let formDataParamsStr = _.map(this.body.formDataParams, (dataParam) => {
      if (!dataParam.name || !dataParam.value) {
        throw utils.getErrorMessage('FormData parameter must have name and value', JSON.stringify(dataParam));
      }
      return [
        '-----------------------' + this.body.boundary,
        '\n',
        `Content-Disposition: form-data; name="${dataParam.name}"`,
        '\n',
        '\n',
        dataParam.value,
        '\n'
      ].join('');
    }).join('');

    return `${formDataParamsStr}-----------------------${this.body.boundary}--`;
  }

  _buildXwwwFormUrlencodedBody() {
    if (!this.body.formDataParams || !_.isArray(this.body.formDataParams) || this.body.formDataParams.length === 0) {
      throw utils.getErrorMessage('Body with ContentType=application/x-www-form-urlencoded must have parameters');
    }

    let formDataParamsStr = _.map(this.body.formDataParams, (dataParam) => {
      if (!dataParam.name || !dataParam.value) {
        throw utils.getErrorMessage('FormData parameter must have name and value', JSON.stringify(dataParam));
      }
      return dataParam.name + '=' + dataParam.value;
    }).join('&');

    return formDataParamsStr;
  }

  _getHostName() {
    let match = this.url.match(/(www[0-9]?\.)?(.[^/]+)/i);
    if (match && match.length > 2) {
      return _.trimStart(match[2], '/');
    }
  }
}

module.exports = HttpZBuilder;
