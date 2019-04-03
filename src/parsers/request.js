'use strict';

const _       = require('lodash');
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
    this._parseMessageForRows();
    this._parseStartRow();
    this._parseHeaderRows();
    this._parseCookiesRow();
    this._parseBodyRows();

    return this._generateModel();
  }

  _parseMessageForRows() {
    let { startRow, headerRows, bodyRows } = super._parseMessageForRows();

    let cookiesRow;
    let cookiesIndex = _.findIndex(headerRows, row => _.startsWith(row, 'Cookie')); // TODO: can be in lower case
    if (cookiesIndex !== -1) {
      cookiesRow = headerRows[cookiesIndex];
      headerRows.splice(cookiesIndex, 1);
    }

    this.startRow = startRow;
    this.hostRow = headerRows[0];
    this.headerRows = headerRows.splice(1);
    this.cookiesRow = cookiesRow;
    this.bodyRows = bodyRows;
  }

  _parseStartRow() {
    if (!consts.regexps.requestStartRow.test(this.startRow)) {
      throw utils.getError(
        'Incorrect startRow format, expected: Method SP Request-URI SP HTTP-Version CRLF',
        this.startRow
      );
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

  _parseCookiesRow() {
    if (!this.cookiesRow) {
      this.cookies = null;
      return;
    }

    let [unused, values] = utils.splitIntoTwoParts(this.cookiesRow, ':');
    if (!unused || !values) {
      throw utils.getError('Incorrect cookie row format, expected: Cookie: Name1=Value1;...', this.cookiesRow);
    }
    this.cookies = _.chain(values)
      .split(';')
      .map(pair => {
        let [name, value] = _.split(pair, '=');
        let cookie = {
          name: _.trim(name),
          value: _.trim(value) || null
        };
        if (!cookie.name) {
          throw utils.getError('Incorrect cookie pair format, expected: Name1=Value1;...', values);
        }
        return cookie;
      })
      .value();
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
    return url.protocol.replace(':', '').toUpperCase();
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
