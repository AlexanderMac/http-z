'use strict';

const _      = require('lodash');
const os     = require('os');
const consts = require('./consts');
const utils  = require('./utils');

class HttpZBuilder {
  static build(params) {
    let instance = new HttpZBuilder(params);
    return instance.build();
  }

  constructor(httpObj) {
    this.httpObj = httpObj;
  }

  build() {
    if (!this.httpObj) {
      throw utils.getErrorMessage('httpObj must be defined');
    }
    this.method = this.httpObj.method;
    this.url = this.httpObj.url;
    this.protocol = this.httpObj.protocol;
    this.protocolVersion = this.httpObj.protocolVersion;
    this.headers = this.httpObj.headers;
    this.cookies = this.httpObj.cookies;
    this.body = this.httpObj.body;

    return '' +
      this._generateStartLine() +
      this._generateHostLine() +
      this._generateHeaders() +
      this._generateCookies() +
      this._generateBody();
  }

  _generateStartLine() {
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
    let newUrl = _.trimStart(this.url, '/');
    return `${this.method} ${this.protocol.toLowerCase()}://${newUrl} ${this.protocolVersion}\n`;
  }

  _generateHostLine() {
    let host = this._getHostName();
    return `HOST: ${host}\n`;
  }

  _generateHeaders() {
    if (!this.headers || !_.isArray(this.headers) || !this.headers.length) {
      throw utils.getErrorMessage('Headers must be defined');
    }

    let headerLines = _.map(this.headers, (header) => {
      if (!header.name) {
        throw utils.getErrorMessage('Header name must be defined', JSON.stringify(header));
      }

      if (!header.values || !_.isArray(header.values) || !header.values.length) {
        throw utils.getErrorMessage('Header values must be defined', JSON.stringify(header));
      }

      let hvs = _.map(header.values, (headerValue) => {
        let hv = headerValue.value;
        if (!hv) {
          throw utils.getErrorMessage('Header value must be defined', JSON.stringify(header));
        }

        if (headerValue.params) {
          hv += ';' + headerValue.params;
        }
        return hv;
      });

      return header.name + ': ' + hvs.join(', ');
    });

    return headerLines.join(os.EOL) + os.EOL;
  }

  _generateCookies() {
    if (!this.cookies) {
      return '';
    }

    if (!_.isArray(this.cookies) || !this.cookies.length) {
      throw utils.getErrorMessage('Cookie name-value pairs must be defined');
    }

    let nameValuePairs = _.map(this.cookies, (nameValuePair) => {
      if (!nameValuePair.name || !nameValuePair.value) {
        throw utils.getErrorMessage('Cookie name or value must be defined', JSON.stringify(nameValuePair));
      }

      return nameValuePair.name + '=' + nameValuePair.value;
    });

    return 'Cookie: ' + nameValuePairs.join('; ') + os.EOL;
  }

  _generateBody() {
    if (!this.body) {
      return os.EOL;
    }

    let formDataParams;
    switch (this.body.contentType) {
      case consts.http.contentTypes.formData:
        if (!this.body.boundary) {
          throw utils.getErrorMessage(
            'Body with ContentType=multipart/form-data must have boundary in ContentType header');
        }

        if (!this.body.formDataParams || !_.isArray(this.body.formDataParams) || !this.body.formDataParams.length) {
          throw utils.getErrorMessage('Body with ContentType=multipart/form-data must have parameters');
        }

        formDataParams = _.map(this.body.formDataParams, (dataParam) => {
          if (!dataParam.name || !dataParam.value) {
            throw utils.getErrorMessage('FormData parameter must have name and value', JSON.stringify(dataParam));
          }
          return [
            '-----------------------' + this.body.boundary,
            os.EOL,
            `Content-Disposition: form-data; name="${dataParam.name}"`,
            os.EOL,
            os.EOL,
            dataParam.value,
            os.EOL
          ].join('');
        }).join('');

        return `\n${formDataParams}-----------------------${this.body.boundary}--`;

      case consts.http.contentTypes.xWwwFormUrlencoded:
        if (!this.body.formDataParams || !_.isArray(this.body.formDataParams) || !this.body.formDataParams.length) {
          throw utils.getErrorMessage('Body with ContentType=application/x-www-form-urlencoded must have parameters');
        }

        formDataParams = _.map(this.body.formDataParams, (dataParam) => {
          if (!dataParam.name || !dataParam.value) {
            throw utils.getErrorMessage('FormData parameter must have name and value', JSON.stringify(dataParam));
          }
          return dataParam.name + '=' + dataParam.value;
        }).join('&');

        return `\n${formDataParams}`;

      case consts.http.contentTypes.json:
        return '\n' + this.body.json;

      default:
        return `\n${this.body.plain}`;
    }
  }

  _getHostName() {
    let match = this.url.match(/(www[0-9]?\.)?(.[^/]+)/i);
    if (match && match.length > 2) {
      return _.trimStart(match[2], '/');
    }
  }
}

module.exports = HttpZBuilder;
