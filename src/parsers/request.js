'use strict';

const _          = require('lodash');
const consts     = require('../consts');
const utils      = require('../utils');
const validators = require('../validators');
const Base       = require('./base');

class HttpZRequestParser extends Base {
  static parse(params) {
    let instance = new HttpZRequestParser(params);
    return instance.parse();
  }

  parse() {
    this._parseMessageForRows();
    this._parseHostRow();
    this._parseStartRow();
    this._parseHeaderRows();
    this._parseCookiesRow();
    this._parseBodyRows();

    return this._generateModel();
  }

  _parseMessageForRows() {
    let { startRow, headerRows, bodyRows } = super._parseMessageForRows();

    this.startRow = startRow;
    this.hostRow = _.find(headerRows, row => _.chain(row).toLower().startsWith('host:').value());
    this.cookiesRow = _.find(headerRows, row => _.chain(row).toLower().startsWith('cookie:').value());
    this.headerRows = _.without(headerRows, this.hostRow, this.cookiesRow);
    this.bodyRows = bodyRows;
  }

  _parseHostRow() {
    validators.validateNotEmptyString(this.hostRow, 'host header');
    // eslint-disable-next-line no-unused-vars
    let [unused, value] = utils.splitIntoTwoParts(this.hostRow, ':');
    validators.validateNotEmptyString(value, 'host header value');

    let res = _.attempt(utils.parseUrl.bind(null, value));
    if (_.isError(res)) {
      throw utils.getError('Invalid host', value);
    }
    this.host = res.host;
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
    let path = rowElems[1];

    let url = utils.parseUrl(this.host + path);
    this.protocol = this._getProtocol(url);
    this.path = url.pathname;
    this.queryParams = this._getQueryParams(url);
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
      queryParams: this.queryParams,
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
  _getQueryParams(url) {
    let queryParams = {};
    url.searchParams.forEach((value, name) => queryParams[name] = value);
    return queryParams;
  }
}

module.exports = HttpZRequestParser;
