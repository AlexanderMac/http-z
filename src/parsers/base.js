'use strict';

const _      = require('lodash');
const consts = require('../consts');
const utils  = require('../utils');

class HttpZBaseParser {
  constructor({ httpMessage, eol = '\n' } = {}) {
    this.httpMessage = httpMessage;
    this.eol = eol;
  }

  parse() {
    if (!this.httpMessage) {
      throw utils.getErrorMessage('httpMessage must be defined');
    }
  }

  _parseMessageForRows() {
    let eol2x = this.eol + this.eol;
    let [headers, body] = utils.splitIntoTwoParts(this.httpMessage, eol2x);
    if (_.isNil(headers) || _.isNil(body)) {
      throw utils.getErrorMessage(
        'HTTP message must contain headers and body, separated by two break lines');
    }

    let headerRows = _.split(headers, this.eol);
    let cookiesIndex = _.findIndex(headerRows, (row) => {
      return _.startsWith(row, 'Cookie:');
    });
    let cookiesRow;
    if (cookiesIndex !== -1) {
      cookiesRow = headerRows[cookiesIndex];
      headerRows.splice(cookiesIndex, 1);
    }

    return { headerRows, cookiesRow, bodyRows: body };
  }

  _parseHeaderRows() {
    this.headers = _.map(this.headerRows, hRow => {
      let [name, values] = utils.splitIntoTwoParts(hRow, ':');
      if (!name || !values) {
        throw utils.getErrorMessage('Header row must be in format: Name: Values', hRow);
      }
      values = _.split(values, ',');
      if (!name || values.length === 0 || _.some(values, val => _.isEmpty(val))) {
        throw utils.getErrorMessage('Header row must be in format: Name: Values', hRow);
      }
      let valuesAndParams = _.map(values, (value) => {
        let valueAndParams = _.split(value, ';');
        return {
          value: _.trim(valueAndParams[0]),
          params: valueAndParams.length > 1 ? _.trim(valueAndParams[1]) : null
        };
      });

      return {
        name: utils.getHeaderName(name),
        values: valuesAndParams
      };
    });
  }

  _parseCookiesRow() {
    if (!this.cookiesRow) {
      this.cookies = null;
      return;
    }

    let [header, values] = utils.splitIntoTwoParts(this.cookiesRow, ':');
    if (!header || !values) {
      throw utils.getErrorMessage('Cookie row must be in format: Cookie: Name1=Value1;...', this.cookiesRow);
    }

    let nameValuePairs = _.split(values, ';');
    if (nameValuePairs.length === 0) {
      throw utils.getErrorMessage('Cookie pair must be in format: Name1=Value1;...', values);
    }

    this.cookies = _.chain(nameValuePairs)
      .map((nameValuePair) => {
        let nameValue = _.split(nameValuePair, '=');
        return !nameValue[0] ?
          null :
          {
            name: _.trim(nameValue[0]),
            value: nameValue.length > 1 ? _.trim(nameValue[1]) : null
          };
      })
      .compact()
      .value();
  }

  _parseBodyRows() {
    if (!this.bodyRows) {
      this.body = null;
      return;
    }

    let contentTypeHeaderValue = _.get(this._getContentTypeHeader(), 'value');
    this.body = {};
    if (contentTypeHeaderValue) {
      this.body.contentType = contentTypeHeaderValue;
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
    let contentTypeHeader = this._getContentTypeHeader();

    this.body.boundary = this._getBoundaryParameter(contentTypeHeader.params);

    let params = _.split(this.bodyRows, `-----------------------${this.body.boundary}`);

    this.body.formDataParams = _.chain(params)
      .slice(1, params.length - 1)
      .map(param => {
        let paramMatch = param.match(consts.regexps.param);
        if (!paramMatch) {
          throw utils.getErrorMessage('Invalid formData parameter', param);
        }

        let paramNameMatch = paramMatch.toString().match(consts.regexps.paramName); // TODO: refactor to remove toString
        if (!paramNameMatch) {
          throw utils.getErrorMessage('formData parameter name must be in format: Name="Value"', param);
        }

        let paramNameParts = _.split(paramNameMatch, '=');
        if (paramNameParts.length !== 2) {
          throw utils.getErrorMessage('formData parameter name must be in format: Name="Value"', param);
        }
        let paramName = paramNameParts[1];
        let paramValue = param.replace(paramMatch, '').trim(this.eol);

        return {
          name: paramName.toString().replace(consts.regexps.quote, ''), // TODO: refactor to remove toString
          value: paramValue
        };
      })
      .value();
  }

  _parseXwwwFormUrlencodedBody() {
    this.body.formDataParams = _.chain(this.bodyRows)
      .split('&')
      .map(param => {
        let paramValue = _.split(param, '=');
        if (paramValue.length !== 2) {
          throw utils.getErrorMessage('Invalid x-www-form-url-encode parameter', param);
        }

        return !paramValue[0] ?
          null :
          {
            name: paramValue[0],
            value: paramValue.length > 1 ? paramValue[1] : null
          };
      })
      .compact()
      .value();
  }

  _parseJsonBody() {
    let json = _.attempt(JSON.parse.bind(null, this.bodyRows));
    this.body.json = _.isError(json) ?
      { success: false, message: 'Invalid JSON' } :
      json;
  }

  _parsePlainBody() {
    this.body.plain = this.bodyRows;
  }

  _getContentTypeHeader() {
    let contentTypeHeader = _.find(this.headers, { name: consts.http.headers.contentType });
    if (!contentTypeHeader) {
      return null;
    }
    return contentTypeHeader.values[0];
  }

  _getBoundaryParameter() {
    let contentTypeHeader = this._getContentTypeHeader();
    if (!contentTypeHeader || !contentTypeHeader.params) {
      throw utils.getErrorMessage('Request with ContentType=FormData must have a header with boundary');
    }

    let boundaryMatch = contentTypeHeader.params.match(consts.regexps.boundary);
    if (!boundaryMatch) {
      throw utils.getErrorMessage('Boundary param must be in format: boundary=value', contentTypeHeader.params);
    }

    let boundaryAndValue = _.split(boundaryMatch, '=');
    if (boundaryAndValue.length !== 2) {
      throw utils.getErrorMessage('Boundary param must be in format: boundary=value', contentTypeHeader.params);
    }

    let boundaryValue =  _.trim(boundaryAndValue[1]);
    if (!boundaryValue) {
      throw utils.getErrorMessage('Boundary param must be in format: boundary=value', contentTypeHeader.params);
    }
    return boundaryValue;
  }
}

module.exports = HttpZBaseParser;
