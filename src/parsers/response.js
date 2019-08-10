'use strict';

const _          = require('lodash');
const consts     = require('../consts');
const HttpZError = require('../error');
const utils      = require('../utils');
const Base       = require('./base');

class HttpZResponseParser extends Base {
  static parse(...params) {
    let instance = new HttpZResponseParser(...params);
    return instance.parse();
  }

  parse() {
    this._parseMessageForRows();
    this._parseStartRow();
    this._parseHeaderRows();
    this._parseCookieRows();
    this._parseBodyRows();

    return this._generateModel();
  }

  _parseMessageForRows() {
    let { startRow, headerRows, bodyRows } = super._parseMessageForRows();

    this.startRow = startRow;
    this.cookieRows = _.filter(headerRows, row => _.chain(row).toLower().startsWith('set-cookie').value());
    this.headerRows = _.without(headerRows, ...this.cookieRows);
    this.bodyRows = bodyRows;
  }

  _parseStartRow() {
    if (!consts.regexps.responseStartRow.test(this.startRow)) {
      throw HttpZError.get(
        'Incorrect startRow format, expected: HTTP-Version SP Status-Code SP Status-Message CRLF',
        this.startRow
      );
    }

    let rowElems = this.startRow.split(' ');
    this.protocolVersion = rowElems[0].toUpperCase();
    this.statusCode = +rowElems[1];
    this.statusMessage = rowElems.splice(2).join(' ');
  }

  _parseCookieRows() {
    if (_.isEmpty(this.cookieRows)) {
      this.cookies = null;
      return;
    }

    this.cookies = _.map(this.cookieRows, cookiesRow => {
      // eslint-disable-next-line no-unused-vars
      let [unused, values] = utils.splitIntoTwoParts(cookiesRow, ':');
      if (!values) {
        throw HttpZError.get('Incorrect set-cookie row format, expected: Set-Cookie: Name1=Value1;...', cookiesRow);
      }
      let params = _.split(values, ';');

      let [name, value] = _.chain(params).head().split('=').value();
      let cookie = {
        name: _.trim(name),
        value: _.trim(value) || null,
        params: _.chain(params).slice(1).map(p => _.trim(p)).value()
      };

      if (!cookie.name) {
        throw HttpZError.get('Incorrect cookie pair format, expected: Name1=Value1;...', values);
      }
      if (_.isEmpty(cookie.params)) {
        cookie.params = null;
      }

      return cookie;
    });
  }

  _generateModel() {
    return {
      protocolVersion: this.protocolVersion,
      statusCode: this.statusCode,
      statusMessage: this.statusMessage,
      headers: this.headers,
      cookies: this.cookies,
      body: this.body
    };
  }
}

module.exports = HttpZResponseParser;
