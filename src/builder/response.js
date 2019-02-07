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
    if (!this.protocolVersion) {
      throw utils.getErrorMessage('protocolVersion must be defined');
    }
    if (!this.statusCode) {
      throw utils.getErrorMessage('statusCode must be defined');
    }
    if (!this.statusMessage) {
      throw utils.getErrorMessage('statusMessage must be defined');
    }

    let protocolVersion = this.protocolVersion.toUpperCase();
    return `${protocolVersion} ${this.statusCode} ${this.statusMessage}\n`;
  }
}

module.exports = HttpZResponseBuilder;
