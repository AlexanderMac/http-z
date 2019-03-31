'use strict';

const { URL } = require('url');
const consts  = require('../consts');
const utils   = require('../utils');
const Base    = require('./base');

class HttpZRequestParser extends Base {
  static parse(params) {
    let instance = new HttpZRequestParser(params);
    return instance.parse();
  }

  parse() {
    super.parse();

    this._parseMessageForRows();
    this._parseStartRow();
    this._parseHeaderRows();
    this._parseCookiesRow();
    this._parseBodyRows();

    return this._generateModel();
  }

  _parseMessageForRows() {
    let { headerRows, cookiesRow, bodyRows } = super._parseMessageForRows();

    this.startRow = headerRows[0];
    this.hostRow = headerRows[1];
    this.headerRows = headerRows.splice(2);
    this.cookiesRow = cookiesRow;
    this.bodyRows = bodyRows;
  }

  _parseStartRow() {
    if (!consts.regexps.requestStartRow.test(this.startRow)) {
      throw utils.getErrorMessage('Method SP Request-URI SP HTTP-Version CRLF', this.startRow);
    }

    let rowElems = this.startRow.split(' ');
    this.method = rowElems[0].toUpperCase();
    this.protocolVersion = rowElems[2].toUpperCase();
    let rawUrl = rowElems[1];

    let url = new URL(rawUrl);
    this.protocol = this._getProtocol(url);
    this.host = url.host;
    this.path = url.pathname;
    this.params = this._getParams(url);
    this.basicAuth = this._getBasicAuth(url);
  }

  _generateModel() {
    return {
      method: this.method,
      protocol: this.protocol,
      protocolVersion: this.protocolVersion,
      host: this.host,
      path: this.path,
      params: this.params,
      basicAuth: this.basicAuth,
      headers: this.headers,
      cookies: this.cookies,
      body: this.body
    };
  }

  // TODO: test it
  _getProtocol(url) {
    return (url.protocol || '').replace(':', '').toUpperCase();
  }

  // TODO: test it
  _getParams(url) {
    let params = {};
    url.searchParams.forEach((value, name) => params[name] = value);
    return params;
  }

  // TODO: test it
  _getBasicAuth(url) {
    let basicAuth = {};
    if (url.username) {
      basicAuth.username = url.username;
    }
    if (url.password) {
      basicAuth.password = url.password;
    }
    return basicAuth;
  }
}

module.exports = HttpZRequestParser;
