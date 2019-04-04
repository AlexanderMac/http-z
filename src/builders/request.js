'use strict';

const _          = require('lodash');
const utils      = require('../utils');
const validators = require('../validators');
const Base       = require('./base');

class HttpZRequestBuilder extends Base {
  static build(params) {
    let instance = new HttpZRequestBuilder(params);
    return instance.build();
  }

  constructor({ method, protocol, protocolVersion, host, path, params = {}, basicAuth = {}, headers, cookies, body }) {
    super({ headers, body });
    this.method = method;
    this.protocol = protocol;
    this.protocolVersion = protocolVersion;
    this.host = host;
    this.path = path;
    this.params = params;
    this.basicAuth = basicAuth;
    this.cookies = cookies;
  }

  build() {
    return '' +
      this._generateStartRow() +
      this._generateHostRow() +
      this._generateHeaderRows() +
      this._generateCookiesRow() +
      this._generateBodyRows();
  }

  _generateStartRow() {
    validators.validateNotEmptyString(this.method, 'method');
    validators.validateNotEmptyString(this.protocol, 'protocol');
    validators.validateNotEmptyString(this.protocolVersion, 'protocolVersion');
    validators.validateNotEmptyString(this.host, 'host');
    validators.validateNotEmptyString(this.path, 'path');

    return '' +
      this.method.toUpperCase() + ' ' +
      utils.generateRelativeUrl(_.pick(this, 'path', 'params')) + ' ' +
      this.protocolVersion.toUpperCase() +
      '\n';
  }

  _generateHostRow() {
    return `Host: ${this.host}\n`;
  }

  _generateCookiesRow() {
    if (!this.cookies) {
      return '';
    }

    validators.validateNotEmptyArray(this.cookies, 'cookies');

    let cookiesStr = _.map(this.cookies, ({ name, value }, index) => {
      validators.validateNotEmptyString(name, 'cookie name', `cookie index: ${index}`);
      return name + '=' + (value || '');
    });

    return 'Cookie: ' + cookiesStr.join('; ') + '\n';
  }
}

module.exports = HttpZRequestBuilder;
