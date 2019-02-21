'use strict';

const _                   = require('lodash');
const { URLSearchParams } = require('url');
const utils               = require('../utils');
const Base                = require('./base');

class HttpZRequestBuilder extends Base {
  static build(params) {
    let instance = new HttpZRequestBuilder(params);
    return instance.build();
  }

  constructor({ method, protocol, protocolVersion, host, path, searchParams = {}, basicAuth = {}, headers, cookies, body }) {
    super({ headers, body });
    this.method = method;
    this.protocol = protocol;
    this.protocolVersion = protocolVersion;
    this.host = host;
    this.path = path;
    this.searchParams = searchParams;
    this.basicAuth = basicAuth;
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
    utils.validateNotEmptyString(this.method, 'method');
    utils.validateNotEmptyString(this.protocol, 'protocol');
    utils.validateNotEmptyString(this.protocolVersion, 'protocolVersion');
    utils.validateNotEmptyString(this.host, 'host');
    utils.validateNotEmptyString(this.path, 'path');

    return '' +
      this.method.toUpperCase() + ' ' +
      this.protocol.toLowerCase() + '://' +
      this._genBasicAuth() +
      this.host +
      this.path +
      this._genSearchParams() + ' ' +
      this.protocolVersion.toUpperCase() +
      '\n';
  }

  _generateHostRow() {
    return `Host: ${this.host}\n`;
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

  // TODO: test it
  _genBasicAuth() {
    if (_.isEmpty(this.basicAuth)) {
      return '';
    }
    return (this.basicAuth.username || '') + ':' + (this.basicAuth.password || '') + '@';
  }

  // TODO: test it
  _genSearchParams() {
    if (_.isEmpty(this.searchParams)) {
      return '';
    }
    let searchParams = new URLSearchParams(this.searchParams);
    return '?' + searchParams.toString();
  }
}

module.exports = HttpZRequestBuilder;
