'use strict';

const _     = require('lodash');
const utils = require('../utils');
const Base  = require('./base');

class HttpZRequestBuilder extends Base {
  static build(params) {
    let instance = new HttpZRequestBuilder(params);
    return instance.build();
  }

  constructor({ method, url, protocol, protocolVersion, headers, cookies, body }) {
    super({ headers, body });
    this.method = method;
    this.url = url;
    this.protocol = protocol;
    this.protocolVersion = protocolVersion;
    this.cookies = cookies;
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
      throw utils.getErrorMessage('method must be defined');
    }
    if (!this.url) {
      throw utils.getErrorMessage('url must be defined');
    }
    if (!this.protocol) {
      throw utils.getErrorMessage('protocol must be defined');
    }
    if (!this.protocolVersion) {
      throw utils.getErrorMessage('protocolVersion must be defined');
    }

    let method = this.method.toUpperCase();
    let url = _.trimStart(this.url, '/');
    let protocol = _.toLower(this.protocol);
    let protocolVersion = this.protocolVersion.toUpperCase();
    return `${method} ${protocol}://${url} ${protocolVersion}\n`;
  }

  _generateHostRow() {
    let host = utils.getHostname(this.url);
    return `Host: ${host}\n`;
  }

  _generateCookieRows() {
    if (!this.cookies) {
      return '';
    }

    if (!_.isArray(this.cookies) || this.cookies.length === 0) {
      throw utils.getErrorMessage('Cookies must be not empty array');
    }

    let cookiesStr = _.map(this.cookies, ({ name, value }) => {
      if (!name || !value) {
        throw utils.getErrorMessage('Cookie name and value must be defined', JSON.stringify({ name, value }));
      }
      return name + '=' + value;
    });

    return 'Cookie: ' + cookiesStr.join('; ') + '\n';
  }
}

module.exports = HttpZRequestBuilder;
