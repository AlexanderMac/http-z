(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('lodash')) :
  typeof define === 'function' && define.amd ? define(['lodash'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.httpZ = factory(global._));
}(this, (function (require$$0) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

  const EOL = '\r\n';
  const EOL2X = EOL + EOL;
  const BASIC_LATIN = '[\\u0009\\u0020-\\u007E]';
  const PARAM_NAME = '[A-Za-z0-9_.\\[\\]-]'; // TODO: extend
  const HTTP_METHODS = '(CONNECT|OPTIONS|TRACE|GET|HEAD|POST|PUT|PATCH|DELETE)';
  const HTTP_PROTOCOL_VERSIONS = '(HTTP)\\/(1\\.0|1\\.1|2(\\.0){0,1})';

  const regexps = {};
  regexps.quote = /"/g;
  regexps.startNl = new RegExp(`^${EOL}`);
  regexps.endNl = new RegExp(`${EOL}$`);
  regexps.requestStartRow = new RegExp(`^${HTTP_METHODS} \\S* ${HTTP_PROTOCOL_VERSIONS}$`);
  regexps.responseStartRow = new RegExp(`^${HTTP_PROTOCOL_VERSIONS} \\d{3} ${BASIC_LATIN}*$`);
  // eslint-disable-next-line no-control-regex
  regexps.quoutedHeaderValue = new RegExp('^"[\\u0009\\u0020\\u0021\\u0023-\\u007E]+"$');
  regexps.boundary = /(?<=boundary=)"{0,1}[A-Za-z0-9'()+_,.:=?-]+"{0,1}/;
  regexps.contentDisposition = new RegExp(`^Content-Disposition: *(form-data|inline|attachment)${BASIC_LATIN}*${EOL}`, 'i');
  regexps.contentType = new RegExp(`^Content-Type:[\\S ]*${EOL}`, 'i');
  regexps.contentDispositionType = /(?<=Content-Disposition:) *(form-data|inline|attachment)/;
  regexps.dispositionName = new RegExp(`(?<=name=)"${PARAM_NAME}+"`, 'i');
  regexps.dispositionFileName = new RegExp(`(?<=filename=)"${PARAM_NAME}+"`, 'i');

  const http = {};

  http.protocols = {
    http: 'HTTP',
    https: 'HTTPS'
  };

  http.protocolVersions = {
    http10: 'HTTP/1.0',
    http11: 'HTTP/1.1',
    http20: 'HTTP/2.0'
  };

  http.methods = {
    connect: 'CONNECT',
    options: 'OPTIONS',
    trace: 'TRACE',
    head: 'HEAD',
    get: 'GET',
    post: 'POST',
    put: 'PUT',
    patch: 'PATCH',
    delete: 'DELETE'
  };

  http.postMethods = [
    http.methods.post,
    http.methods.put,
    http.methods.patch
  ];

  http.contentTypes = {
    text: {
      any: 'text/',
      css: 'text/css',
      csv: 'text/csv',
      html: 'text/html',
      javascript: 'text/javascript',
      plain: 'text/plain',
      xml: 'text/xml'
    },
    application: {
      any: 'application/',
      javascript: 'application/javascript',
      json: 'application/json',
      octetStream: 'application/octet-stream',
      ogg: 'application/ogg',
      pdf: 'application/pdf',
      xhtml: 'application/xhtml+xml',
      xml: 'application/xml',
      xShockwaveFlash: 'application/x-shockwave-flash',
      xWwwFormUrlencoded: 'application/x-www-form-urlencoded',
      zip: 'application/zip'
    },
    multipart: {
      any: 'multipart/',
      alternative: 'multipart/alternative',
      formData: 'multipart/form-data',
      mixed: 'multipart/mixed',
      related: 'multipart/related'
    },
    image: {
      any: 'image/',
      gif: 'image/gif',
      jpeg: 'image/jpeg',
      png: 'image/png',
      tiff: 'image/tiff',
      icon: 'image/x-icon'
    },
    audio: {
      any: 'audio/'
    },
    video: {
      any: 'audio/'
    },
    font: {
      any: 'font/'
    }
  };

  http.headers = {
    contentType: 'Content-Type',
    contentLength: 'Content-Length',
    userAgent: 'User-Agent',
    setCookie: 'Set-Cookie'
  };

  var consts$8 = {
    EOL,
    EOL2X,
    regexps,
    http
  };

  var error = class HttpZError extends Error {
    static get(...params) {
      return new HttpZError(...params)
    }

    constructor(message, details) {
      super(message);

      this.name = this.constructor.name;
      this.details = details;

      Error.captureStackTrace(this, this.constructor);
    }
  };

  var utils$6 = {};

  var validators$4 = {};

  (function (exports) {
  const _ = require$$0__default['default'];
  const HttpZError = error;

  exports.validateRequired = (val, field, details) => {
    if (_.isNil(val)) {
      throw HttpZError.get(`${field} is required`, details)
    }
  };

  exports.validateString = (val, field, details) => {
    exports.validateRequired(val, field, details);
    if (!_.isString(val)) {
      throw HttpZError.get(`${field} must be a string`, details)
    }
  };

  exports.validateNotEmptyString = (val, field, details) => {
    exports.validateString(val, field, details);
    if (_.isEmpty(val)) {
      throw HttpZError.get(`${field} must be not empty string`, details)
    }
  };

  exports.validateNumber = (val, field, details) => {
    exports.validateRequired(val, field, details);
    if (!_.isNumber(val)) {
      throw HttpZError.get(`${field} must be a number`, details)
    }
  };

  exports.validatePositiveNumber = (val, field, details) => {
    exports.validateNumber(val, field, details);
    if ( val <= 0) {
      throw HttpZError.get(`${field} must be a positive number`, details)
    }
  };

  exports.validateArray = (val, field, details) => {
    exports.validateRequired(val, field, details);
    if (!_.isArray(val)) {
      throw HttpZError.get(`${field} must be an array`, details)
    }
  };
  }(validators$4));

  (function (exports) {
  const _ = require$$0__default['default'];
  const validators = validators$4;

  exports.splitByDelimeter = (str, delimiter) => {
    if (_.isEmpty(str)) {
      return []
    }

    let delimiterIndex = str.indexOf(delimiter);
    if (delimiterIndex === -1) {
      return []
    }

    let res = [str.slice(0, delimiterIndex), str.slice(delimiterIndex + delimiter.length)];
    res[0] = _.trim(res[0], ' ');
    res[1] = _.trim(res[1], ' ');

    return res
  };

  exports.parseUrl = (path, origin) => {
    if (!origin) {
      origin = path;
      path = null;
    }
    const knownProtocols = ['http', 'https'];
    if (!_.find(knownProtocols, known => _.startsWith(origin, known + '://'))) {
      origin = 'http://' + origin;
    }

    let parsedUrl = path ? new URL(path, origin) : new URL(origin);
    let protocol = parsedUrl.protocol.replace(':', '').toUpperCase();
    let params = [];
    parsedUrl.searchParams.forEach((value, name) => params.push({ name, value }));

    return {
      protocol,
      host: parsedUrl.host,
      path: parsedUrl.pathname,
      params
    }
  };

  // eslint-disable-next-line max-params
  exports.generateUrl = (protocol, host, port, path, params) => {
    let result = '';
    if (host) {
      result += protocol.toLowerCase() + '://' + host;
      if (port && !host.includes(':')) {
        result += ':' + port;
      }
    }
    let pathWithParams = exports.generatePath(path, params);
    result += pathWithParams;

    return result
  };

  exports.generatePath = (path, params) => {
    if (_.isEmpty(params)) {
      return path
    }
    let paramPairs = exports.convertParamsArrayToPairs(params);

    return path + '?' + new URLSearchParams(paramPairs).toString()
  };

  exports.convertParamsArrayToPairs = (params) => {
    validators.validateArray(params, 'params');

    return _.map(params, ({ name, value }) => [
      name,
      exports.getEmptyStringForUndefined(value)]
    )
  };

  exports.pretifyHeaderName = (name) => {
    return _.chain(name)
      .split('-')
      .map(_.capitalize)
      .join('-')
      .value()
  };

  exports.getEmptyStringForUndefined = (val) => {
    if (_.isUndefined(val)) {
      return ''
    }
    return val
  };

  exports.extendIfNotUndefined = (obj, fieldName, fieldValue) => {
    if (!_.isUndefined(fieldValue)) {
      obj[fieldName] = fieldValue;
    }
  };
  }(utils$6));

  const _$8 = require$$0__default['default'];
  const consts$7 = consts$8;
  const utils$5 = utils$6;
  const HttpZError$5 = error;

  class FormDataParamParser {
    // TODO: test it
    static parse(...params) {
      let instance = new FormDataParamParser(...params);
      return instance.parse()
    }

    constructor(paramGroup) {
      this.paramGroup = paramGroup;
    }

    // TODO: test it
    parse() {
      this.paramGroup = this.paramGroup
        .replace(consts$7.regexps.startNl, '')
        .replace(consts$7.regexps.endNl, '');

      let contentDispositionHeader = this._getContentDisposition();
      let contentType = this._getContentType();
      let dispositionType = this._getDispositionType(contentDispositionHeader);
      let name = dispositionType === 'form-data' ? this._getParamName(contentDispositionHeader) : undefined;
      let fileName = this._getFileName(contentDispositionHeader);
      let value = this._getParamValue();

      let param = {
        value
      };
      if (dispositionType !== 'form-data') {
        param.type = dispositionType;
      }
      utils$5.extendIfNotUndefined(param, 'contentType', contentType);
      utils$5.extendIfNotUndefined(param, 'name', name);
      utils$5.extendIfNotUndefined(param, 'fileName', fileName);

      return param
    }

    // TODO: test it
    _getContentDisposition() {
      let contentDisposition = this.paramGroup.match(consts$7.regexps.contentDisposition);
      if (!contentDisposition) {
        throw HttpZError$5.get('Incorrect Content-Disposition', this.paramGroup)
      }
      this.paramGroup = this.paramGroup.replace(contentDisposition[0], '');
      contentDisposition = _$8.trimEnd(contentDisposition[0], consts$7.EOL);
      return contentDisposition
    }

    // TODO: test it
    _getContentType() {
      let contentType = this.paramGroup.match(consts$7.regexps.contentType);
      if (contentType) {
        this.paramGroup = this.paramGroup.replace(contentType[0], '');
        return _$8.chain(contentType)
          .toLower()
          .replace(/^content-type: */, '')
          .trimEnd(consts$7.EOL)
          .value()
      }
    }

    // TODO: test it
    _getDispositionType(contentDisposition) {
      let dispositionType = contentDisposition.match(consts$7.regexps.contentDispositionType);
      if (!dispositionType) {
        throw HttpZError$5.get('Incorrect Content-Disposition type', contentDisposition)
      }
      dispositionType = _$8.chain(dispositionType[0]).trim().toLower().value();
      return dispositionType
    }

    // TODO: test it
    _getParamName(contentDisposition) {
      let paramName = contentDisposition.match(consts$7.regexps.dispositionName);
      if (!paramName) {
        throw HttpZError$5.get('Incorrect Content-Disposition, expected param name', contentDisposition)
      }
      paramName = _$8.trim(paramName, '"');
      return paramName
    }

    // TODO: test it
    _getFileName(contentDisposition) {
      let fileName = contentDisposition.match(consts$7.regexps.dispositionFileName);
      if (fileName) {
        return _$8.trim(fileName, '"')
      }
    }

    // TODO: test it
    _getParamValue() {
      let value;
      if (this.paramGroup.match(consts$7.regexps.startNl)) {
        value = this.paramGroup.replace(consts$7.regexps.startNl, '');
      } else {
        throw HttpZError$5.get('Incorrect form-data parameter', this.paramGroup)
      }
      return value
    }
  }

  var formDataParamParser$1 = FormDataParamParser;

  const _$7 = require$$0__default['default'];
  const consts$6 = consts$8;
  const HttpZError$4 = error;
  const utils$4 = utils$6;
  const formDataParamParser = formDataParamParser$1;

  class HttpZBaseParser {
    constructor(rawMessage) {
      this.rawMessage = rawMessage;
    }

    _parseMessageForRows() {
      let [headers, body] = utils$4.splitByDelimeter(this.rawMessage, consts$6.EOL2X);
      if (_$7.isNil(headers) || _$7.isNil(body)) {
        throw HttpZError$4.get(
          'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]'
        )
      }

      this._calcSizes(headers, body);
      let headerRows = _$7.split(headers, consts$6.EOL);

      return {
        startRow: _$7.head(headerRows),
        headerRows: _$7.tail(headerRows),
        bodyRows: body
      }
    }

    _parseHeaderRows() {
      this.headers = _$7.map(this.headerRows, hRow => {
        let [name, value] = utils$4.splitByDelimeter(hRow, ':');
        if (!name) {
          throw HttpZError$4.get('Incorrect header row format, expected: Name: Value', hRow)
        }

        // quoted string must be parsed as a single value (https://tools.ietf.org/html/rfc7230#section-3.2.6)
        if (_$7.isNil(value)) {
          value = '';
        } else if (consts$6.regexps.quoutedHeaderValue.test(value)) {
          value = _$7.trim(value, '"');
        }

        return {
          name: utils$4.pretifyHeaderName(name),
          value
        }
      });
    }

    _parseBodyRows() {
      if (!this.bodyRows) {
        return
      }

      this.body = {};
      let contentTypeHeader = this._getContentTypeValue();
      if (contentTypeHeader) {
        this.body.contentType = contentTypeHeader.split(';')[0];
      }
      switch (this.body.contentType) {
        case consts$6.http.contentTypes.multipart.formData:
        case consts$6.http.contentTypes.multipart.alternative:
        case consts$6.http.contentTypes.multipart.mixed:
        case consts$6.http.contentTypes.multipart.related:
          this._parseFormDataBody();
          break
        case consts$6.http.contentTypes.application.xWwwFormUrlencoded:
          this._parseUrlencodedBody();
          break
        default:
          this._parseTextBody();
          break
      }
    }

    _parseFormDataBody() {
      this.body.boundary = this._getBoundary();
      this.body.params = _$7.chain(this.bodyRows)
        .split(`--${this.body.boundary}`)
        // skip first and last items, which contains boundary
        .filter((unused, index, params) => index > 0 && index < params.length - 1)
        .map(paramGroup => formDataParamParser.parse(paramGroup))
        .value();
    }

    _parseUrlencodedBody() {
      let params = new URLSearchParams(this.bodyRows);
      this.body.params = [];
      params.forEach((value, name) => {
        this.body.params.push({ name, value });
      });
    }

    _parseTextBody() {
      this.body.text = this.bodyRows;
    }

    _calcSizes(headers, body) {
      this.headersSize = (headers + consts$6.EOL2X).length;
      this.bodySize = body.length;
    }

    _getContentTypeValue() {
      let contentTypeHeader = _$7.find(this.headers, { name: consts$6.http.headers.contentType });
      if (!contentTypeHeader) {
        return
      }
      if (!contentTypeHeader.value) {
        return
      }
      return contentTypeHeader.value.toLowerCase()
    }

    _getBoundary() {
      let contentTypeValue = this._getContentTypeValue();
      if (!contentTypeValue) {
        throw HttpZError$4.get('Message with multipart/form-data body must have Content-Type header with boundary')
      }

      let params = contentTypeValue.split(';')[1];
      if (!params) {
        throw HttpZError$4.get('Message with multipart/form-data body must have Content-Type header with boundary')
      }

      let boundary = params.match(consts$6.regexps.boundary);
      if (!boundary) {
        throw HttpZError$4.get('Incorrect boundary, expected: boundary=value', params)
      }
      return _$7.trim(boundary[0], '"')
    }
  }

  var base$1 = HttpZBaseParser;

  const _$6 = require$$0__default['default'];
  const consts$5 = consts$8;
  const HttpZError$3 = error;
  const utils$3 = utils$6;
  const validators$3 = validators$4;
  const Base$3 = base$1;

  class HttpZRequestParser extends Base$3 {
    static parse(...params) {
      let instance = new HttpZRequestParser(...params);
      return instance.parse()
    }

    parse() {
      this._parseMessageForRows();
      this._parseHostRow();
      this._parseStartRow();
      this._parseHeaderRows();
      this._parseCookiesRow();
      this._parseBodyRows();

      return this._generateModel()
    }

    _parseMessageForRows() {
      let { startRow, headerRows, bodyRows } = super._parseMessageForRows();

      this.startRow = startRow;
      this.hostRow = _$6.find(headerRows, row => _$6.chain(row).toLower().startsWith('host:').value());
      this.cookiesRow = _$6.find(headerRows, row => _$6.chain(row).toLower().startsWith('cookie:').value());
      this.headerRows = _$6.without(headerRows, this.hostRow, this.cookiesRow);
      this.bodyRows = bodyRows;
    }

    _parseHostRow() {
      validators$3.validateNotEmptyString(this.hostRow, 'host header');
      // eslint-disable-next-line no-unused-vars
      let [unused, value] = utils$3.splitByDelimeter(this.hostRow, ':');
      validators$3.validateNotEmptyString(value, 'host header value');

      let res = _$6.attempt(utils$3.parseUrl.bind(null, value));
      if (_$6.isError(res)) {
        throw HttpZError$3.get('Invalid host', value)
      }
      this.host = decodeURIComponent(res.host);
    }

    _parseStartRow() {
      if (!consts$5.regexps.requestStartRow.test(this.startRow)) {
        throw HttpZError$3.get(
          'Incorrect startRow format, expected: Method request-target HTTP-Version',
          this.startRow
        )
      }

      let rowElems = this.startRow.split(' ');
      this.method = rowElems[0].toUpperCase();
      this.protocolVersion = rowElems[2].toUpperCase();
      let path = rowElems[1];

      let parsedUrl = utils$3.parseUrl(path, this.host);
      this.protocol = parsedUrl.protocol;
      this.path = decodeURIComponent(parsedUrl.path);
      this.queryParams = parsedUrl.params;
    }

    _parseCookiesRow() {
      if (!this.cookiesRow) {
        return
      }

      let [cookieHeaderName, values] = utils$3.splitByDelimeter(this.cookiesRow, ':');
      if (!cookieHeaderName) {
        throw HttpZError$3.get('Incorrect cookie row format, expected: Cookie: Name1=Value1;...', this.cookiesRow)
      }
      if (!values) {
        this.cookies = [];
        return
      }
      this.cookies = _$6.chain(values)
        .split(';')
        .map(pair => {
          let [name, value] = utils$3.splitByDelimeter(pair, '=');
          let cookie = {
            name
          };
          if (value) {
            cookie.value = value;
          }
          if (!cookie.name) {
            throw HttpZError$3.get('Incorrect cookie pair format, expected: Name1=Value1;...', values)
          }
          return cookie
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

      return model
    }
  }

  var request$1 = HttpZRequestParser;

  const _$5 = require$$0__default['default'];
  const consts$4 = consts$8;
  const HttpZError$2 = error;
  const utils$2 = utils$6;
  const Base$2 = base$1;

  class HttpZResponseParser extends Base$2 {
    static parse(...params) {
      let instance = new HttpZResponseParser(...params);
      return instance.parse()
    }

    parse() {
      this._parseMessageForRows();
      this._parseStartRow();
      this._parseHeaderRows();
      this._parseCookieRows();
      this._parseBodyRows();

      return this._generateModel()
    }

    _parseMessageForRows() {
      let { startRow, headerRows, bodyRows } = super._parseMessageForRows();

      this.startRow = startRow;
      this.cookieRows = _$5.filter(headerRows, row => _$5.chain(row).toLower().startsWith('set-cookie').value());
      this.headerRows = _$5.without(headerRows, ...this.cookieRows);
      this.bodyRows = bodyRows;
    }

    _parseStartRow() {
      if (!consts$4.regexps.responseStartRow.test(this.startRow)) {
        throw HttpZError$2.get(
          'Incorrect startRow format, expected: HTTP-Version status-code reason-phrase',
          this.startRow
        )
      }

      let rowElems = this.startRow.split(' ');
      this.protocolVersion = rowElems[0].toUpperCase();
      this.statusCode = +rowElems[1];
      this.statusMessage = rowElems.splice(2).join(' ');
    }

    _parseCookieRows() {
      if (_$5.isEmpty(this.cookieRows)) {
        return
      }

      // eslint-disable-next-line max-statements
      this.cookies = _$5.map(this.cookieRows, cookiesRow => {
        // eslint-disable-next-line no-unused-vars
        let [unused, values] = utils$2.splitByDelimeter(cookiesRow, ':');
        if (!values) {
          throw HttpZError$2.get('Incorrect set-cookie row format, expected: Set-Cookie: Name1=Value1;...', cookiesRow)
        }
        let params = _$5.split(values, ';');
        let paramWithName = _$5.head(params);
        let otherParams = _$5.tail(params);

        let [name, value] = _$5.split(paramWithName, '=');
        name = _$5.trim(name);
        value = _$5.trim(value);
        if (!name) {
          throw HttpZError$2.get('Incorrect set-cookie pair format, expected: Name1=Value1;...', values)
        }

        let cookie = {
          name
        };
        if (value) {
          cookie.value = value;
        }
        if (otherParams.length > 0) {
          cookie.params = _$5.map(otherParams, p => _$5.trim(p));
        }

        return cookie
      });
    }

    _generateModel() {
      let model = {
        protocolVersion: this.protocolVersion,
        statusCode: this.statusCode,
        statusMessage: this.statusMessage,
        headersSize: this.headersSize,
        bodySize: this.bodySize
      };
      if (this.headers) {
        model.headers = this.headers;
      }
      if (this.cookies) {
        model.cookies = this.cookies;
      }
      if (this.body) {
        model.body = this.body;
      }

      return model
    }
  }

  var response$1 = HttpZResponseParser;

  const _$4 = require$$0__default['default'];
  const consts$3 = consts$8;
  const HttpZError$1 = error;
  const RequestParser = request$1;
  const ResponseParser = response$1;

  var parsers = (rawMessage) => {
    if (_$4.isNil(rawMessage)) {
      throw HttpZError$1.get('rawMessage is required')
    }
    if (!_$4.isString(rawMessage)) {
      throw HttpZError$1.get('rawMessage must be a string')
    }

    let firstRow = _$4.chain(rawMessage).split(consts$3.EOL).head().value();
    if (consts$3.regexps.requestStartRow.test(firstRow)) {
      return RequestParser.parse(rawMessage)
    }
    if (consts$3.regexps.responseStartRow.test(firstRow)) {
      return ResponseParser.parse(rawMessage)
    }
    throw HttpZError$1.get('rawMessage has incorrect format')
  };

  const _$3 = require$$0__default['default'];
  const consts$2 = consts$8;
  const utils$1 = utils$6;
  const validators$2 = validators$4;

  class HttpZBaseBuilder {
    constructor({ headers, body }) {
      this.headers = headers;
      this.body = body;
    }

    _generateHeaderRows() {
      validators$2.validateArray(this.headers, 'headers');

      if (_$3.isEmpty(this.headers)) {
        return ''
      }

      let headerRowsStr = _$3.chain(this.headers)
        .map((header, index) => {
          validators$2.validateNotEmptyString(header.name, 'header name', `header index: ${index}`);
          validators$2.validateString(header.value, 'header.value', `header index: ${index}`);

          let headerName = utils$1.pretifyHeaderName(header.name);
          let headerValue = header.value;

          return headerName + ': ' + headerValue
        })
        .join(consts$2.EOL)
        .value();

      return headerRowsStr + consts$2.EOL
    }

    _generateBodyRows() {
      if (_$3.isEmpty(this.body)) {
        return ''
      }

      switch (this.body.contentType) {
        case consts$2.http.contentTypes.multipart.formData:
        case consts$2.http.contentTypes.multipart.alternative:
        case consts$2.http.contentTypes.multipart.mixed:
        case consts$2.http.contentTypes.multipart.related:
          return this._generateFormDataBody()
        case consts$2.http.contentTypes.application.xWwwFormUrlencoded:
          return this._generateUrlencodedBody()
        default:
          return this._generateTextBody()
      }
    }

    _generateFormDataBody() {
      validators$2.validateArray(this.body.params, 'body.params');
      validators$2.validateNotEmptyString(this.body.boundary, 'body.boundary');

      if (_$3.isEmpty(this.body.params)) {
        return ''
      }

      // eslint-disable-next-line max-statements
      let paramsStr = _$3.map(this.body.params, (param, index) => {
        if (!param.type) {
          validators$2.validateNotEmptyString(param.name, 'body.params[index].name', `param index: ${index}`);
        }
        let paramGroupStr = '--' + this.body.boundary;
        paramGroupStr += consts$2.EOL;
        paramGroupStr += `Content-Disposition: ${param.type || 'form-data'}`;
        if (param.name) {
          paramGroupStr += `; name="${param.name}"`;
        }
        if (param.fileName) {
          paramGroupStr += `; filename="${param.fileName}"`;
        }
        paramGroupStr += consts$2.EOL;
        if (param.contentType) {
          paramGroupStr += `Content-Type: ${param.contentType}`;
          paramGroupStr += consts$2.EOL;
        }
        paramGroupStr += consts$2.EOL;
        paramGroupStr += utils$1.getEmptyStringForUndefined(param.value);
        paramGroupStr += consts$2.EOL;
        return paramGroupStr
      }).join('');

      return `${paramsStr}--${this.body.boundary}--`
    }

    _generateUrlencodedBody() {
      validators$2.validateArray(this.body.params, 'body.params');
      let paramPairs = utils$1.convertParamsArrayToPairs(this.body.params);

      return new URLSearchParams(paramPairs).toString()
    }

    _generateTextBody() {
      return utils$1.getEmptyStringForUndefined(this.body.text)
    }
  }

  var base = HttpZBaseBuilder;

  const _$2 = require$$0__default['default'];
  const consts$1 = consts$8;
  const utils = utils$6;
  const validators$1 = validators$4;
  const Base$1 = base;

  class HttpZRequestBuilder extends Base$1 {
    static build(model) {
      let instance = new HttpZRequestBuilder(model);
      return instance.build()
    }

    constructor({ method, protocol, protocolVersion, host, path, queryParams = [], headers, cookies, body }) {
      super({ headers, body });
      this.method = method;
      this.protocol = protocol;
      this.protocolVersion = protocolVersion;
      this.host = host;
      this.path = path;
      this.queryParams = queryParams;
      this.cookies = cookies;
    }

    build() {
      return '' +
        this._generateStartRow() +
        this._generateHostRow() +
        this._generateHeaderRows() +
        this._generateCookiesRow() +
        consts$1.EOL +
        this._generateBodyRows()
    }

    _generateStartRow() {
      validators$1.validateNotEmptyString(this.method, 'method');
      validators$1.validateNotEmptyString(this.protocol, 'protocol');
      validators$1.validateNotEmptyString(this.protocolVersion, 'protocolVersion');
      validators$1.validateNotEmptyString(this.host, 'host');
      validators$1.validateNotEmptyString(this.path, 'path');

      return '' +
        this.method.toUpperCase() + ' ' +
        utils.generatePath(this.path, this.queryParams) + ' ' +
        this.protocolVersion.toUpperCase() +
        consts$1.EOL
    }

    _generateHostRow() {
      return 'Host: ' + this.host + consts$1.EOL
    }

    _generateHeaderRows() {
      validators$1.validateArray(this.headers, 'headers');

      _$2.remove(this.headers, h => {
        let hName = _$2.toLower(h.name);
        return hName === 'host' || hName === 'cookie'
      });

      return super._generateHeaderRows()
    }

    _generateCookiesRow() {
      if (_$2.isEmpty(this.cookies)) {
        return ''
      }

      validators$1.validateArray(this.cookies, 'cookies');

      let cookiesStr = _$2.map(this.cookies, ({ name, value }, index) => {
        validators$1.validateNotEmptyString(name, 'cookie name', `cookie index: ${index}`);
        return name + '=' + (value || '')
      });

      return 'Cookie: ' + cookiesStr.join('; ') + consts$1.EOL
    }
  }

  var request = HttpZRequestBuilder;

  const _$1 = require$$0__default['default'];
  const consts = consts$8;
  const validators = validators$4;
  const Base = base;

  class HttpZResponseBuilder extends Base {
    static build(model) {
      let instance = new HttpZResponseBuilder(model);
      return instance.build()
    }

    constructor({ protocolVersion, statusCode, statusMessage, headers, body, cookies }) {
      super({ headers, body });
      this.protocolVersion = protocolVersion;
      this.statusCode = statusCode;
      this.statusMessage = statusMessage;
      this.cookies = cookies;
    }

    build() {
      return '' +
        this._generateStartRow() +
        this._generateHeaderRows() +
        this._generateCookieRows() +
        consts.EOL +
        this._generateBodyRows()
    }

    _generateStartRow() {
      validators.validateNotEmptyString(this.protocolVersion, 'protocolVersion');
      validators.validatePositiveNumber(this.statusCode, 'statusCode');
      validators.validateNotEmptyString(this.statusMessage, 'statusMessage');

      let protocolVersion = this.protocolVersion.toUpperCase();
      return `${protocolVersion} ${this.statusCode} ${this.statusMessage}` + consts.EOL
    }

    _generateHeaderRows() {
      validators.validateArray(this.headers, 'headers');

      _$1.remove(this.headers, h => {
        let hName = _$1.toLower(h.name);
        return hName === 'set-cookie'
      });

      return super._generateHeaderRows()
    }

    _generateCookieRows() {
      if (_$1.isEmpty(this.cookies)) {
        return ''
      }

      validators.validateArray(this.cookies, 'cookies');

      if (_$1.isEmpty(this.cookies)) {
        return ''
      }

      let cookieRowsStr = _$1.chain(this.cookies)
        .map(({ name, value, params }, index) => {
          validators.validateNotEmptyString(name, 'cookie name', `cookie index: ${index}`);
          let paramsStr = '';
          if (params) {
            validators.validateArray(params, 'cookie params', `cookie index: ${index}`);
            paramsStr = '; ' + params.join('; ');
          }
          return `Set-Cookie: ${name}=${value || ''}` + paramsStr
        })
        .join(consts.EOL)
        .value();

      return cookieRowsStr + consts.EOL
    }
  }

  var response = HttpZResponseBuilder;

  const _ = require$$0__default['default'];
  const HttpZError = error;
  const RequestBuilder = request;
  const ResponseBuilder = response;

  var builders = (messageModel) => {
    if (_.isNil(messageModel)) {
      throw HttpZError.get('messageModel is required')
    }
    if (!_.isPlainObject(messageModel)) {
      throw HttpZError.get('messageModel must be a plain object')
    }
    if (messageModel.method) {
      return RequestBuilder.build(messageModel)
    }
    if (messageModel.statusCode) {
      return ResponseBuilder.build(messageModel)
    }
    throw HttpZError.get('messageModel has incorrect format')
  };

  var httpZ = {
    consts: consts$8,
    HttpZError: error,
    utils: utils$6,
    parse: parsers,
    build: builders
  };

  return httpZ;

})));
