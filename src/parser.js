'use strict';

const _      = require('lodash');
const consts = require('./consts');
const utils  = require('./utils');

class HttpZParser {
  static parse(params) {
    let instance = new HttpZParser(params);
    return instance.parse();
  }

  constructor(httpMsg, eol = '\n') {
    this.httpMsg = httpMsg;
    this.eol = eol;
  }

  parse() {
    if (!this.httpMsg) {
      throw utils.getErrorMessage('httpMsg must be defined');
    }

    let requestMsgLines = this._parseRequestForLines();

    let header = this._parseHeaderLine(requestMsgLines.header);
    let host = this._parseHostLine(requestMsgLines.host);
    let headers = this._parseHeadersLines(requestMsgLines.headers);
    let cookies = this._parseCookieLine(requestMsgLines.cookies);

    let contentTypeHeader = this._getContentTypeHeader(headers);
    let body = this._parseBody(requestMsgLines.body, contentTypeHeader);

    return {
      method: header.method,
      protocol: header.protocol,
      url: header.url,
      protocolVersion: header.protocolVersion,
      host,
      headers,
      cookies,
      body
    };
  }

  _parseRequestForLines() {
    let headersAndBodySeparator = this.eol + this.eol;
    let headersAndBodySeparatorIndex = this.httpMsg.indexOf(headersAndBodySeparator);
    if (headersAndBodySeparatorIndex === -1) {
      throw utils.getErrorMessage(
        'Request must contain headers and body, separated by two break lines');
    }

    let headers = this.httpMsg.substr(0, headersAndBodySeparatorIndex);
    let body = this.httpMsg.substr(headersAndBodySeparatorIndex + headersAndBodySeparator.length);

    let headersLines = _.split(headers, this.eol);
    if (headersLines.length === 0) {
      throw utils.getErrorMessage('No headers');
    }

    let cookieIndex = _.findIndex(headersLines, (line) => {
      return _.startsWith(line, 'Cookie:');
    });
    let cookieLine;
    if (cookieIndex !== -1) {
      cookieLine = headersLines[cookieIndex];
      headersLines.splice(cookieIndex, 1);
    }

    return {
      header: headersLines[0],
      host: headersLines[1],
      headers: headersLines.splice(2),
      cookies: cookieLine,
      body: body
    };
  }

  _parseHeaderLine(line) {
    let methodUrlProtocolVer = _.split(line, ' ');
    if (methodUrlProtocolVer.length !== 3) {
      throw utils.getErrorMessage('start-line must have format: [Method] [Url] [Protocol]', line);
    }

    let protocolAndUrl = utils.splitIntoTwoParts(methodUrlProtocolVer[1], '://');
    if (!protocolAndUrl) {
      throw utils.getErrorMessage(
        'Url in start-line must have format: [Protocol]://[Address]',
        methodUrlProtocolVer[1]
      );
    }

    return {
      method: methodUrlProtocolVer[0].toUpperCase(),
      protocol: protocolAndUrl[0].toUpperCase(),
      url: protocolAndUrl[1].toLowerCase(),
      protocolVersion: methodUrlProtocolVer[2].toUpperCase()
    };
  }

  _parseHostLine(line) {
    let headerAndValue = utils.splitIntoTwoParts(line, ':');
    if (!headerAndValue) {
      throw utils.getErrorMessage('Host line must have format: [Host]: [Value]', line);
    }

    return headerAndValue[1];
  }

  _parseHeadersLines(lines) {
    // TODO: add check for duplicate headers

    return _.map(lines, line => {
      let headerAndValues = utils.splitIntoTwoParts(line, ':');
      if (!headerAndValues) {
        throw utils.getErrorMessage('Header line must have format: [HeaderName]: [HeaderValues]', line);
      }

      let headerName = headerAndValues[0];
      let values = _.split(headerAndValues[1], ',');
      if (!headerName || values.length === 0 || _.some(values, val => _.isEmpty(val))) {
        throw utils.getErrorMessage('Header line must have format: [HeaderName]: [HeaderValues]', line);
      }

      let valuesAndParams = _.map(values, (value) => {
        let valueAndParams = _.split(value, ';');
        return {
          value: _.trim(valueAndParams[0]),
          params: valueAndParams.length > 1 ? _.trim(valueAndParams[1]) : null
        };
      });

      return {
        name: headerName,
        values: valuesAndParams
      };
    });
  }

  _parseCookieLine(line) {
    if (!line) {
      return null;
    }

    let headerAndValues = utils.splitIntoTwoParts(line, ':');
    if (!headerAndValues) {
      throw utils.getErrorMessage('Cookie line must have format: Cookie: [Name1]=[Value1]...', line);
    }

    let nameValuePairs = _.split(headerAndValues[1], ';');
    if (nameValuePairs.length === 0) {
      throw utils.getErrorMessage('Cookie line must have format: Cookie: [Name1]=[Value1]...', line);
    }

    return _.chain(nameValuePairs)
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

  _parseBody(lines, contentTypeHeader) {
    if (!lines) {
      return null;
    }

    let body = {};

    if (!contentTypeHeader) {
      this._parsePlainBody(lines, body);
      return body;
    }

    body.contentType = contentTypeHeader.value;
    switch (body.contentType) {
      case consts.http.contentTypes.formData:
        this._parseFormDataBody(lines, body, contentTypeHeader.params);
        break;

      case consts.http.contentTypes.xWwwFormUrlencoded:
        this._parseXwwwFormUrlencodedBody(lines, body);
        break;

      case consts.http.contentTypes.json:
        this._parseJsonBody(lines, body);
        break;

      default:
        this._parsePlainBody(lines, body);
        break;
    }

    return body;
  }

  _parseFormDataBody(lines, body, contentTypeHeadeParams) {
    body.boundary = this._getBoundaryParameter(contentTypeHeadeParams);

    let params = _.split(lines, `-----------------------${body.boundary}`);

    body.formDataParams = _.chain(params)
      .slice(1, params.length - 1)
      .map(param => {
        let paramMatch = param.match(consts.regexps.param);
        if (!paramMatch) {
          throw utils.getErrorMessage('Invalid formData parameter', param);
        }

        let paramNameMatch = paramMatch.toString().match(consts.regexps.paramName); // TODO: refactor to remove toString
        if (!paramNameMatch) {
          throw utils.getErrorMessage('formData parameter name must have format: [Name]="[Value]"', param);
        }

        let paramNameParts = _.split(paramNameMatch, '=');
        if (paramNameParts.length !== 2) {
          throw utils.getErrorMessage('formData parameter name must have format: [Name]="[Value]"', param);
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

  _parseXwwwFormUrlencodedBody(lines, body) {
    let params = _.split(lines, '&');

    body.formDataParams = _.chain(params)
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

  _parseJsonBody(lines, body) {
    body.json = lines;
  }

  _parsePlainBody(lines, body) {
    body.plain = lines;
  }

  _getContentTypeHeader(headers) {
    let contentTypeHeader = _.find(headers, { name: consts.http.headers.contentType });
    if (!contentTypeHeader) {
      return null;
    }
    return contentTypeHeader.values[0];
  }

  _getBoundaryParameter(contentTypeHeaderParams) {
    if (!contentTypeHeaderParams) {
      throw utils.getErrorMessage('Request with ContentType=FormData must have a header with boundary');
    }

    let boundaryMatch = contentTypeHeaderParams.match(consts.regexps.boundary);
    if (!boundaryMatch) {
      throw utils.getErrorMessage('Boundary param must have format: [boundary]=[value]', contentTypeHeaderParams);
    }

    let boundaryAndValue = _.split(boundaryMatch, '=');
    if (boundaryAndValue.length !== 2) {
      throw utils.getErrorMessage('Boundary param must have format: [boundary]=[value]', contentTypeHeaderParams);
    }

    let boundaryValue =  _.trim(boundaryAndValue[1]);
    if (!boundaryValue) {
      throw utils.getErrorMessage('Boundary param must have format: [boundary]=[value]', contentTypeHeaderParams);
    }
    return boundaryValue;
  }
}

module.exports = HttpZParser;
