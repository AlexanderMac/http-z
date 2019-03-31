'use strict';

const utils = require('../utils');
const Base  = require('./base');

class HttpZResponseBuilder extends Base {
  static build(params) {
    let instance = new HttpZResponseBuilder(params);
    return instance.build();
  }

  constructor({ protocolVersion, statusCode, statusMessage, headers, body }) {
    super({ headers, body });
    this.protocolVersion = protocolVersion;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
  }

  build() {
    return '' +
      this._generateStartRow() +
      this._generateHeaderRows() +
      this._generateBodyRows();
  }

  _generateStartRow() {
    utils.validateNotEmptyString(this.protocolVersion, 'protocolVersion');
    utils.validateNotZeroNumber(this.statusCode, 'statusCode');
    utils.validateNotEmptyString(this.statusMessage, 'statusMessage');

    let protocolVersion = this.protocolVersion.toUpperCase();
    return `${protocolVersion} ${this.statusCode} ${this.statusMessage}\n`;
  }
}

module.exports = HttpZResponseBuilder;