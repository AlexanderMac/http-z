(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('lodash')) :
  typeof define === 'function' && define.amd ? define(['lodash'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.httpZ = factory(global._));
}(this, (function (_) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var ___default = /*#__PURE__*/_interopDefaultLegacy(_);

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
  // TODO: maybe incorrect, because basicLatin contains quote
  regexps.quoutedHeaderValue = new RegExp(`^"${BASIC_LATIN}+"$`);
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

  var consts = {
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

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  var validators = createCommonjsModule(function (module, exports) {
  exports.validateRequired = (val, field, details) => {
    if (___default['default'].isNil(val)) {
      throw error.get(`${field} is required`, details)
    }
  };

  exports.validateString = (val, field, details) => {
    exports.validateRequired(val, field, details);
    if (!___default['default'].isString(val)) {
      throw error.get(`${field} must be a string`, details)
    }
  };

  exports.validateNotEmptyString = (val, field, details) => {
    exports.validateString(val, field, details);
    if (___default['default'].isEmpty(val)) {
      throw error.get(`${field} must be not empty string`, details)
    }
  };

  exports.validateNumber = (val, field, details) => {
    exports.validateRequired(val, field, details);
    if (!___default['default'].isNumber(val)) {
      throw error.get(`${field} must be a number`, details)
    }
  };

  exports.validatePositiveNumber = (val, field, details) => {
    exports.validateNumber(val, field, details);
    if ( val <= 0) {
      throw error.get(`${field} must be a positive number`, details)
    }
  };

  exports.validateArray = (val, field, details) => {
    exports.validateRequired(val, field, details);
    if (!___default['default'].isArray(val)) {
      throw error.get(`${field} must be an array`, details)
    }
  };
  });

  var utils = createCommonjsModule(function (module, exports) {
  exports.splitByDelimeter = (str, delimiter) => {
    if (___default['default'].isEmpty(str)) {
      return []
    }

    let delimiterIndex = str.indexOf(delimiter);
    if (delimiterIndex === -1) {
      return []
    }

    let res = [str.slice(0, delimiterIndex), str.slice(delimiterIndex + delimiter.length)];
    res[0] = ___default['default'].trim(res[0], ' ');
    res[1] = ___default['default'].trim(res[1], ' ');

    return res
  };

  exports.parseUrl = (path, origin) => {
    if (!origin) {
      origin = path;
      path = null;
    }
    const knownProtocols = ['http', 'https'];
    if (!___default['default'].find(knownProtocols, known => ___default['default'].startsWith(origin, known + '://'))) {
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
  exports.generateUrl = (protocol, host, path, params) => {
    let result = '';
    if (host) {
      result += protocol.toLowerCase() + '://' + host;
    }
    let pathWithParams = exports.generatePath(path, params);
    result += pathWithParams;

    return result
  };

  exports.generatePath = (path, params) => {
    if (___default['default'].isEmpty(params)) {
      return path
    }
    let paramPairs = exports.convertParamsArrayToPairs(params);

    return path + '?' + new URLSearchParams(paramPairs).toString()
  };

  exports.convertParamsArrayToPairs = (params) => {
    validators.validateArray(params, 'params');

    return ___default['default'].map(params, ({ name, value }) => [
      name,
      exports.getEmptyStringForUndefined(value)]
    )
  };

  exports.pretifyHeaderName = (name) => {
    return ___default['default'].chain(name)
      .split('-')
      .map(___default['default'].capitalize)
      .join('-')
      .value()
  };

  exports.getEmptyStringForUndefined = (val) => {
    if (___default['default'].isUndefined(val)) {
      return ''
    }
    return val
  };

  exports.extendIfNotUndefined = (obj, fieldName, fieldValue) => {
    if (!___default['default'].isUndefined(fieldValue)) {
      obj[fieldName] = fieldValue;
    }
  };
  });

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
        .replace(consts.regexps.startNl, '')
        .replace(consts.regexps.endNl, '');

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
      utils.extendIfNotUndefined(param, 'contentType', contentType);
      utils.extendIfNotUndefined(param, 'name', name);
      utils.extendIfNotUndefined(param, 'fileName', fileName);

      return param
    }

    // TODO: test it
    _getContentDisposition() {
      let contentDisposition = this.paramGroup.match(consts.regexps.contentDisposition);
      if (!contentDisposition) {
        throw error.get('Incorrect Content-Disposition', this.paramGroup)
      }
      this.paramGroup = this.paramGroup.replace(contentDisposition[0], '');
      contentDisposition = ___default['default'].trimEnd(contentDisposition[0], consts.EOL);
      return contentDisposition
    }

    // TODO: test it
    _getContentType() {
      let contentType = this.paramGroup.match(consts.regexps.contentType);
      if (contentType) {
        this.paramGroup = this.paramGroup.replace(contentType[0], '');
        return ___default['default'].chain(contentType)
          .toLower()
          .replace(/^content-type: */, '')
          .trimEnd(consts.EOL)
          .value()
      }
    }

    // TODO: test it
    _getDispositionType(contentDisposition) {
      let dispositionType = contentDisposition.match(consts.regexps.contentDispositionType);
      if (!dispositionType) {
        throw error.get('Incorrect Content-Disposition type', contentDisposition)
      }
      dispositionType = ___default['default'].chain(dispositionType[0]).trim().toLower().value();
      return dispositionType
    }

    // TODO: test it
    _getParamName(contentDisposition) {
      let paramName = contentDisposition.match(consts.regexps.dispositionName);
      if (!paramName) {
        throw error.get('Incorrect Content-Disposition, expected param name', contentDisposition)
      }
      paramName = ___default['default'].trim(paramName, '"');
      return paramName
    }

    // TODO: test it
    _getFileName(contentDisposition) {
      let fileName = contentDisposition.match(consts.regexps.dispositionFileName);
      if (fileName) {
        return ___default['default'].trim(fileName, '"')
      }
    }

    // TODO: test it
    _getParamValue() {
      let value;
      if (this.paramGroup.match(consts.regexps.startNl)) {
        value = this.paramGroup.replace(consts.regexps.startNl, '');
      } else {
        throw error.get('Incorrect form-data parameter', this.paramGroup)
      }
      return value
    }
  }

  var formDataParamParser = FormDataParamParser;

  class HttpZBaseParser {
    constructor(rawMessage) {
      this.rawMessage = rawMessage;
    }

    _parseMessageForRows() {
      let [headers, body] = utils.splitByDelimeter(this.rawMessage, consts.EOL2X);
      if (___default['default'].isNil(headers) || ___default['default'].isNil(body)) {
        throw error.get(
          'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]'
        )
      }

      this._calcSizes(headers, body);
      let headerRows = ___default['default'].split(headers, consts.EOL);

      return {
        startRow: ___default['default'].head(headerRows),
        headerRows: ___default['default'].tail(headerRows),
        bodyRows: body
      }
    }

    _parseHeaderRows() {
      this.headers = ___default['default'].map(this.headerRows, hRow => {
        let [name, values] = utils.splitByDelimeter(hRow, ':');
        if (!name) {
          throw error.get('Incorrect header row format, expected: Name: Values', hRow)
        }

        let valuesWithParams;
        if (___default['default'].isNil(values) || values === '') {
          valuesWithParams = [];
        // quoted string must be parsed as a single value (https://tools.ietf.org/html/rfc7230#section-3.2.6)
        } else if (consts.regexps.quoutedHeaderValue.test(values)) {
          valuesWithParams = [{ value: ___default['default'].trim(values, '"') }];
        } else if (___default['default'].toLower(name) === consts.http.headers.userAgent.toLowerCase()) { // use 'user-agent' as is
          valuesWithParams = [{ value: values }];
        } else {
          valuesWithParams = ___default['default'].chain(values)
            .split(',')
            .map(value => {
              let valueAndParams = ___default['default'].split(value, ';');
              let res = {
                value: ___default['default'].trim(valueAndParams[0])
              };
              if (valueAndParams.length > 1) {
                res.params = ___default['default'].trim(valueAndParams[1]);
              }
              return res
            })
            .value();
        }

        return {
          name: utils.pretifyHeaderName(name),
          values: valuesWithParams
        }
      });
    }

    _parseBodyRows() {
      if (!this.bodyRows) {
        return
      }

      this.body = {};
      this.body.contentType = this._getContentTypeValue();
      switch (this.body.contentType) {
        case consts.http.contentTypes.multipart.formData:
        case consts.http.contentTypes.multipart.alternative:
        case consts.http.contentTypes.multipart.mixed:
        case consts.http.contentTypes.multipart.related:
          this._parseFormDataBody();
          break
        case consts.http.contentTypes.application.xWwwFormUrlencoded:
          this._parseUrlencodedBody();
          break
        default:
          this._parseTextBody();
          break
      }
    }

    _parseFormDataBody() {
      this.body.boundary = this._getBoundary();
      this.body.params = ___default['default'].chain(this.bodyRows)
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
      this.headersSize = (headers + consts.EOL2X).length;
      this.bodySize = body.length;
    }

    _getContentTypeObject() {
      return ___default['default'].chain(this.headers)
        .find({ name: consts.http.headers.contentType })
        .get('values[0]')
        .value()
    }

    _getContentTypeValue() {
      let contentTypeHeader = this._getContentTypeObject();
      if (!contentTypeHeader) {
        return
      }
      if (!contentTypeHeader.value) {
        return
      }
      return contentTypeHeader.value.toLowerCase()
    }

    _getBoundary() {
      let contentTypeHeader = this._getContentTypeObject();
      if (!contentTypeHeader || !contentTypeHeader.params) {
        throw error.get('Message with multipart/form-data body must have Content-Type header with boundary')
      }

      let boundary = contentTypeHeader.params.match(consts.regexps.boundary);
      if (!boundary) {
        throw error.get('Incorrect boundary, expected: boundary=value', contentTypeHeader.params)
      }
      return ___default['default'].trim(boundary[0], '"')
    }
  }

  var base = HttpZBaseParser;

  class HttpZRequestParser extends base {
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
      this.hostRow = ___default['default'].find(headerRows, row => ___default['default'].chain(row).toLower().startsWith('host:').value());
      this.cookiesRow = ___default['default'].find(headerRows, row => ___default['default'].chain(row).toLower().startsWith('cookie:').value());
      this.headerRows = ___default['default'].without(headerRows, this.hostRow, this.cookiesRow);
      this.bodyRows = bodyRows;
    }

    _parseHostRow() {
      validators.validateNotEmptyString(this.hostRow, 'host header');
      // eslint-disable-next-line no-unused-vars
      let [unused, value] = utils.splitByDelimeter(this.hostRow, ':');
      validators.validateNotEmptyString(value, 'host header value');

      let res = ___default['default'].attempt(utils.parseUrl.bind(null, value));
      if (___default['default'].isError(res)) {
        throw error.get('Invalid host', value)
      }
      this.host = res.host;
    }

    _parseStartRow() {
      if (!consts.regexps.requestStartRow.test(this.startRow)) {
        throw error.get(
          'Incorrect startRow format, expected: Method request-target HTTP-Version',
          this.startRow
        )
      }

      let rowElems = this.startRow.split(' ');
      this.method = rowElems[0].toUpperCase();
      this.protocolVersion = rowElems[2].toUpperCase();
      let path = rowElems[1];

      let parsedUrl = utils.parseUrl(path, this.host);
      this.protocol = parsedUrl.protocol;
      this.path = parsedUrl.path;
      this.queryParams = parsedUrl.params;
    }

    _parseCookiesRow() {
      if (!this.cookiesRow) {
        return
      }

      let [cookieHeaderName, values] = utils.splitByDelimeter(this.cookiesRow, ':');
      if (!cookieHeaderName) {
        throw error.get('Incorrect cookie row format, expected: Cookie: Name1=Value1;...', this.cookiesRow)
      }
      if (!values) {
        this.cookies = [];
        return
      }
      this.cookies = ___default['default'].chain(values)
        .split(';')
        .map(pair => {
          let [name, value] = utils.splitByDelimeter(pair, '=');
          let cookie = {
            name
          };
          if (value) {
            cookie.value = value;
          }
          if (!cookie.name) {
            throw error.get('Incorrect cookie pair format, expected: Name1=Value1;...', values)
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

  var request = HttpZRequestParser;

  class HttpZResponseParser extends base {
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
      this.cookieRows = ___default['default'].filter(headerRows, row => ___default['default'].chain(row).toLower().startsWith('set-cookie').value());
      this.headerRows = ___default['default'].without(headerRows, ...this.cookieRows);
      this.bodyRows = bodyRows;
    }

    _parseStartRow() {
      if (!consts.regexps.responseStartRow.test(this.startRow)) {
        throw error.get(
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
      if (___default['default'].isEmpty(this.cookieRows)) {
        return
      }

      // eslint-disable-next-line max-statements
      this.cookies = ___default['default'].map(this.cookieRows, cookiesRow => {
        // eslint-disable-next-line no-unused-vars
        let [unused, values] = utils.splitByDelimeter(cookiesRow, ':');
        if (!values) {
          throw error.get('Incorrect set-cookie row format, expected: Set-Cookie: Name1=Value1;...', cookiesRow)
        }
        let params = ___default['default'].split(values, ';');
        let paramWithName = ___default['default'].head(params);
        let otherParams = ___default['default'].tail(params);

        let [name, value] = ___default['default'].split(paramWithName, '=');
        name = ___default['default'].trim(name);
        value = ___default['default'].trim(value);
        if (!name) {
          throw error.get('Incorrect set-cookie pair format, expected: Name1=Value1;...', values)
        }

        let cookie = {
          name
        };
        if (value) {
          cookie.value = value;
        }
        if (otherParams.length > 0) {
          cookie.params = ___default['default'].map(otherParams, p => ___default['default'].trim(p));
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

  var response = HttpZResponseParser;

  var parsers = (rawMessage) => {
    if (___default['default'].isNil(rawMessage)) {
      throw error.get('rawMessage is required')
    }
    if (!___default['default'].isString(rawMessage)) {
      throw error.get('rawMessage must be a string')
    }

    let firstRow = ___default['default'].chain(rawMessage).split(consts.EOL).head().value();
    if (consts.regexps.requestStartRow.test(firstRow)) {
      return request.parse(rawMessage)
    }
    if (consts.regexps.responseStartRow.test(firstRow)) {
      return response.parse(rawMessage)
    }
    throw error.get('rawMessage has incorrect format')
  };

  class HttpZBaseBuilder {
    constructor({ headers, body }) {
      this.headers = headers;
      this.body = body;
    }

    _generateHeaderRows() {
      validators.validateArray(this.headers, 'headers');

      if (___default['default'].isEmpty(this.headers)) {
        return ''
      }

      let headerRowsStr = ___default['default'].chain(this.headers)
        .map((header, index) => {
          validators.validateRequired(header.name, 'header name', `header index: ${index}`);
          validators.validateArray(header.values, 'header.values', `header index: ${index}`);

          let headerName = utils.pretifyHeaderName(header.name);
          let headerValues = ___default['default'].chain(header.values)
            .map(headerVal => {
              let value = utils.getEmptyStringForUndefined(headerVal.value);
              if (value && headerVal.params) {
                return value + ';' + headerVal.params
              }
              return value
            })
            .join(', ')
            .value();

          return headerName + ': ' + headerValues
        })
        .join(consts.EOL)
        .value();

      return headerRowsStr + consts.EOL
    }

    _generateBodyRows() {
      if (!this.body) {
        return ''
      }

      switch (this.body.contentType) {
        case consts.http.contentTypes.multipart.formData:
        case consts.http.contentTypes.multipart.alternative:
        case consts.http.contentTypes.multipart.mixed:
        case consts.http.contentTypes.multipart.related:
          return this._generateFormDataBody()
        case consts.http.contentTypes.application.xWwwFormUrlencoded:
          return this._generateUrlencodedBody()
        default:
          return this._generateTextBody()
      }
    }

    _generateFormDataBody() {
      validators.validateArray(this.body.params, 'body.params');
      validators.validateNotEmptyString(this.body.boundary, 'body.boundary');

      if (___default['default'].isEmpty(this.body.params)) {
        return ''
      }

      // eslint-disable-next-line max-statements
      let paramsStr = ___default['default'].map(this.body.params, (param, index) => {
        if (!param.type) {
          validators.validateNotEmptyString(param.name, 'body.params[index].name', `param index: ${index}`);
        }
        let paramGroupStr = '--' + this.body.boundary;
        paramGroupStr += consts.EOL;
        paramGroupStr += `Content-Disposition: ${param.type || 'form-data'}`;
        if (param.name) {
          paramGroupStr += `; name="${param.name}"`;
        }
        if (param.fileName) {
          paramGroupStr += `; filename="${param.fileName}"`;
        }
        paramGroupStr += consts.EOL;
        if (param.contentType) {
          paramGroupStr += `Content-Type: ${param.contentType}`;
          paramGroupStr += consts.EOL;
        }
        paramGroupStr += consts.EOL;
        paramGroupStr += utils.getEmptyStringForUndefined(param.value);
        paramGroupStr += consts.EOL;
        return paramGroupStr
      }).join('');

      return `${paramsStr}--${this.body.boundary}--`
    }

    _generateUrlencodedBody() {
      validators.validateArray(this.body.params, 'body.params');
      let paramPairs = utils.convertParamsArrayToPairs(this.body.params);

      return new URLSearchParams(paramPairs).toString()
    }

    _generateTextBody() {
      return utils.getEmptyStringForUndefined(this.body.text)
    }
  }

  var base$1 = HttpZBaseBuilder;

  class HttpZRequestBuilder extends base$1 {
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
        consts.EOL +
        this._generateBodyRows()
    }

    _generateStartRow() {
      validators.validateNotEmptyString(this.method, 'method');
      validators.validateNotEmptyString(this.protocol, 'protocol');
      validators.validateNotEmptyString(this.protocolVersion, 'protocolVersion');
      validators.validateNotEmptyString(this.host, 'host');
      validators.validateNotEmptyString(this.path, 'path');

      return '' +
        this.method.toUpperCase() + ' ' +
        utils.generatePath(this.path, this.queryParams) + ' ' +
        this.protocolVersion.toUpperCase() +
        consts.EOL
    }

    _generateHostRow() {
      return 'Host: ' + this.host + consts.EOL
    }

    _generateHeaderRows() {
      validators.validateArray(this.headers, 'headers');

      ___default['default'].remove(this.headers, h => {
        let hName = ___default['default'].toLower(h.name);
        return hName === 'host' || hName === 'cookie'
      });

      return super._generateHeaderRows()
    }

    _generateCookiesRow() {
      if (!this.cookies) {
        return ''
      }

      validators.validateArray(this.cookies, 'cookies');

      let cookiesStr = ___default['default'].map(this.cookies, ({ name, value }, index) => {
        validators.validateNotEmptyString(name, 'cookie name', `cookie index: ${index}`);
        return name + '=' + (value || '')
      });

      return 'Cookie: ' + cookiesStr.join('; ') + consts.EOL
    }
  }

  var request$1 = HttpZRequestBuilder;

  class HttpZResponseBuilder extends base$1 {
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

      ___default['default'].remove(this.headers, h => {
        let hName = ___default['default'].toLower(h.name);
        return hName === 'set-cookie'
      });

      return super._generateHeaderRows()
    }

    _generateCookieRows() {
      if (!this.cookies) {
        return ''
      }

      validators.validateArray(this.cookies, 'cookies');

      if (___default['default'].isEmpty(this.cookies)) {
        return ''
      }

      let cookieRowsStr = ___default['default'].chain(this.cookies)
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

  var response$1 = HttpZResponseBuilder;

  var builders = (messageModel) => {
    if (___default['default'].isNil(messageModel)) {
      throw error.get('messageModel is required')
    }
    if (!___default['default'].isPlainObject(messageModel)) {
      throw error.get('messageModel must be a plain object')
    }
    if (messageModel.method) {
      return request$1.build(messageModel)
    }
    if (messageModel.statusCode) {
      return response$1.build(messageModel)
    }
    throw error.get('messageModel has incorrect format')
  };

  var httpZ = {
    consts: consts,
    HttpZError: error,
    utils: utils,
    parse: parsers,
    build: builders
  };

  return httpZ;

})));
