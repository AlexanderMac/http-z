'use strict';

const _          = require('lodash');
const consts     = require('../consts');
const HttpZError = require('../error');
const utils      = require('../utils');

class HttpZBaseParser {
  constructor(plainMessage, eol = '\n') {
    this.plainMessage = plainMessage;
    this.eol = eol;
  }

  _parseMessageForRows() {
    let eol2x = this.eol + this.eol;
    let [headers, body] = utils.splitIntoTwoParts(this.plainMessage, eol2x);
    if (_.isNil(headers) || _.isNil(body)) {
      // special case when message doesn't contain body
      if (/\n+$/g.test(this.plainMessage)) {
        headers = this.plainMessage.replace(/\n+$/g, '');
        body = null;
      } else {
        throw HttpZError.get(
          'Incorrect message format, it must have headers and body, separated by empty line'
        );
      }
    }

    let headerRows = _.split(headers, this.eol);
    return {
      startRow: headerRows[0],
      headerRows: headerRows.splice(1),
      bodyRows: body
    };
  }

  _parseHeaderRows() {
    this.headers = _.map(this.headerRows, hRow => {
      let [name, values] = utils.splitIntoTwoParts(hRow, ':');
      if (!name || !values) {
        throw HttpZError.get('Incorrect header row format, expected: Name: Values', hRow);
      }
      let valuesAndParams;
      if (_.toLower(name) === 'user-agent') { // use 'user-agent' as is
        valuesAndParams = [{
          value: values,
          params: null
        }];
      } else {
        values = _.split(values, ',');
        if (values.length === 0 || _.some(values, val => _.isEmpty(val))) {
          throw HttpZError.get('Incorrect header values format, expected: Value1, Value2, ...', hRow);
        }
        valuesAndParams = _.map(values, (value) => {
          let valueAndParams = _.split(value, ';');
          return {
            value: _.trim(valueAndParams[0]),
            params: valueAndParams.length > 1 ? _.trim(valueAndParams[1]) : null
          };
        });
      }

      return {
        name: utils.getHeaderName(name),
        values: valuesAndParams
      };
    });
  }

  _parseBodyRows() {
    if (!this.bodyRows) {
      this.body = null;
      return;
    }

    this.body = {};
    let contentType = _.get(this._getContentType(), 'value');
    if (contentType) {
      this.body.contentType = contentType;
    }

    switch (this.body.contentType) {
      case consts.http.contentTypes.formData:
        this._parseFormDataBody();
        break;
      case consts.http.contentTypes.xWwwFormUrlencoded:
        this._parseXwwwFormUrlencodedBody();
        break;
      case consts.http.contentTypes.json:
        this._parseJsonBody();
        break;
      default:
        this._parsePlainBody();
        break;
    }
  }

  _parseFormDataBody() {
    this.body.boundary = utils.getBoundary(this._getContentType());

    this.body.formDataParams = _.chain(this.bodyRows)
      .split(`--${this.body.boundary}`)
      .filter((unused, index, params) => index > 0 && index < params.length - 1)
      .map(param => {
        let paramMatch = param.match(consts.regexps.param);
        if (!paramMatch) {
          throw HttpZError.get('Incorrect form-data parameter', param);
        }

        let paramNameMatch = paramMatch.toString().match(consts.regexps.paramName);
        // eslint-disable-next-line no-unused-vars
        let [unused, paramName] = utils.splitIntoTwoParts(paramNameMatch.toString(), '=');

        return {
          name: paramName.replace(consts.regexps.quote, ''),
          value: param.replace(paramMatch, '').trim(this.eol)
        };
      })
      .value();
  }

  _parseXwwwFormUrlencodedBody() {
    this.body.formDataParams = _.chain(this.bodyRows)
      .split('&')
      .map(pair => {
        let [name, value] = utils.splitIntoTwoParts(pair, '=');
        if (!name) {
          throw HttpZError.get('Incorrect x-www-form-urlencoded parameter, expected: Name="Value', pair);
        }
        return { name, value };
      })
      .value();
  }

  _parseJsonBody() {
    let json = _.attempt(JSON.parse.bind(null, this.bodyRows));
    if (_.isError(json)) {
      throw HttpZError.get('Invalid json in body');
    }
    this.body.json = json;
  }

  _parsePlainBody() {
    this.body.plain = this.bodyRows;
  }

  _getContentType() {
    let contentTypeHeader = _.find(this.headers, { name: consts.http.headers.contentType });
    if (!contentTypeHeader) {
      return null;
    }
    return contentTypeHeader.values[0];
  }
}

module.exports = HttpZBaseParser;
