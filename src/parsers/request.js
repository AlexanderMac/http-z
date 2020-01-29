const _ = require('lodash');
const consts = require('../consts');
const HttpZError = require('../error');
const utils = require('../utils');
const validators = require('../validators');
const Base = require('./base');

class HttpZRequestParser extends Base {
  static parse(...params) {
    let instance = new HttpZRequestParser(...params);
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
      throw HttpZError.get('Invalid host', value);
    }
    this.host = res.host;
  }

  _parseStartRow() {
    if (!consts.regexps.requestStartRow.test(this.startRow)) {
      throw HttpZError.get(
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
      return;
    }

    let [unused, values] = utils.splitIntoTwoParts(this.cookiesRow, ':');
    if (!unused || !values) {
      throw HttpZError.get('Incorrect cookie row format, expected: Cookie: Name1=Value1;...', this.cookiesRow);
    }
    this.cookies = _.chain(values)
      .split(';')
      .map(pair => {
        let [name, value] = _.split(pair, '=');
        let cookie = {
          name: _.trim(name)
        };
        if (value) {
          cookie.value = _.trim(value);
        }
        if (!cookie.name) {
          throw HttpZError.get('Incorrect cookie pair format, expected: Name1=Value1;...', values);
        }
        return cookie;
      })
      .value();
  }

  _generateModel() {
    let model = {
      method: this.method,
      protocol: this.protocol,
      protocolVersion: this.protocolVersion,
      host: this.host,
      path: this.path,
      messageSize: this.messageSize,
      headersSize: this.headersSize,
      bodySize: this.bodySize
    };
    if (this.queryParams) {
      model.queryParams = this.queryParams;
    }
    if (this.headers) {
      model.headers = this.headers;
    }
    if (this.cookies) {
      model.cookies = this.cookies;
    }
    if (this.body) {
      model.body = this.body;
    }

    return model;
  }

  // TODO: test it
  _getProtocol(url) {
    return url.protocol.replace(':', '').toUpperCase();
  }

  // TODO: test it
  _getQueryParams(url) {
    let queryParams = [];
    url.searchParams.forEach((value, name) => queryParams.push({ name, value }));
    return queryParams;
  }
}

module.exports = HttpZRequestParser;
