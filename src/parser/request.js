'use strict';

const consts = require('../consts');
const utils  = require('../utils');
const Base   = require('./base');

class HttpZRequestParser extends Base {
  static parse(params) {
    let instance = new HttpZRequestParser(params);
    return instance.parse();
  }

  parse() {
    super.parse();

    this._parseMessageForRows();
    this._parseStartRow();
    this._parseHostRow();
    this._parseHeaderRows();
    this._parseCookiesRow();
    this._parseBodyRows();

    return this._generateObj();
  }

  _parseMessageForRows() {
    let { headerRows, cookiesRow, bodyRows } = super._parseMessageForRows();

    this.startRow = headerRows[0];
    this.hostRow = headerRows[1];
    this.headerRows = headerRows.splice(2);
    this.cookiesRow = cookiesRow;
    this.bodyRows = bodyRows;
  }

  _generateObj() {
    return {
      method: this.method,
      protocol: this.protocol,
      protocolVersion: this.protocolVersion,
      url: this.url,
      host: this.host,
      headers: this.headers,
      cookies: this.cookies,
      body: this.body
    };
  }

  _parseStartRow() {
    if (!consts.regexps.requestStartRow.test(this.startRow)) {
      throw utils.getErrorMessage('Method SP Request-URI SP HTTP-Version CRLF', this.startRow);
    }

    let rowElems = this.startRow.split(' ');
    this.method = rowElems[0].toUpperCase();
    let url = rowElems[1];
    this.url = url.replace(consts.regexps.httpProtocolWithTwoSlash, '');
    this.protocol = url.match(consts.regexps.httpProtocol)[0].toUpperCase();
    this.protocolVersion = rowElems[2];
  }

  _parseHostRow() {
    let [name, value] = utils.splitIntoTwoParts(this.hostRow, ':');
    if (!name || !value) {
      throw utils.getErrorMessage('Host row must be in format: Host: Value', this.hostRow);
    }
    this.host = value;
  }
}

module.exports = HttpZRequestParser;
