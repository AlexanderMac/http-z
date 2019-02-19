'use strict';

const consts = require('../../consts');
const utils  = require('../../utils');
const Base   = require('../base');

class HttpZResponseParser extends Base {
  static parse(params) {
    let instance = new HttpZResponseParser(params);
    return instance.parse();
  }

  parse() {
    super.parse();

    this._parseMessageForRows();
    this._parseStartRow();
    this._parseHeaderRows();
    this._parseBodyRows();

    return this._generateObj();
  }

  _parseMessageForRows() {
    let { headerRows, bodyRows } = super._parseMessageForRows();

    this.startRow = headerRows[0];
    this.headerRows = headerRows.splice(1);
    this.bodyRows = bodyRows;
  }

  _generateObj() {
    return {
      protocolVersion: this.protocolVersion,
      statusCode: this.statusCode,
      statusMessage: this.statusMessage,
      headers: this.headers,
      body: this.body
    };
  }

  _parseStartRow() {
    if (!consts.regexps.responseStartRow.test(this.startRow)) {
      throw utils.getErrorMessage('HTTP-Version SP Status-Code SP Status-Message CRLF', this.startRow);
    }

    let rowElems = this.startRow.split(' ');
    this.protocolVersion = rowElems[0].toUpperCase();
    this.statusCode = +rowElems[1];
    this.statusMessage = rowElems.splice(2).join(' ');
  }
}

module.exports = HttpZResponseParser;
