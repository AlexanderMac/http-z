(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('lodash')) :
	typeof define === 'function' && define.amd ? define(['lodash'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.httpZ = factory(global._));
})(this, (function (require$$0) { 'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var consts;
	var hasRequiredConsts;

	function requireConsts () {
		if (hasRequiredConsts) return consts;
		hasRequiredConsts = 1;
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
		regexps.contentDisposition = new RegExp(
		  `^Content-Disposition: *(form-data|inline|attachment)${BASIC_LATIN}*${EOL}`,
		  'i'
		);
		regexps.contentType = new RegExp(`^Content-Type:[\\S ]*${EOL}`, 'i');
		regexps.contentDispositionType = /(?<=Content-Disposition:) *(form-data|inline|attachment)/;
		regexps.dispositionName = new RegExp(`(?<=name=)"${PARAM_NAME}+"`, 'i');
		regexps.dispositionFileName = new RegExp(`(?<=filename=)"${PARAM_NAME}+"`, 'i');
		regexps.chunkRow = new RegExp(`^[0-9a-fA-F]+${EOL}`);

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

		http.postMethods = [http.methods.post, http.methods.put, http.methods.patch];

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
		  host: 'Host',
		  contentType: 'Content-Type',
		  contentLength: 'Content-Length',
		  userAgent: 'User-Agent',
		  setCookie: 'Set-Cookie',
		  transferEncoding: 'Transfer-Encoding'
		};

		consts = {
		  EOL,
		  EOL2X,
		  regexps,
		  http
		};
		return consts;
	}

	var error;
	var hasRequiredError;

	function requireError () {
		if (hasRequiredError) return error;
		hasRequiredError = 1;
		error = class HttpZError extends Error {
		  static get(...params) {
		    return new HttpZError(...params)
		  }

		  constructor(message, details) {
		    super(message);

		    this.name = this.constructor.name;
		    this.details = details;

		    if (Error.captureStackTrace) {
		      Error.captureStackTrace(this, this.constructor);
		    }
		  }
		};
		return error;
	}

	var utils = {};

	var validators = {};

	var hasRequiredValidators;

	function requireValidators () {
		if (hasRequiredValidators) return validators;
		hasRequiredValidators = 1;
		(function (exports) {
			const _ = require$$0;
			const HttpZError = requireError();

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
			  if (val <= 0) {
			    throw HttpZError.get(`${field} must be a positive number`, details)
			  }
			};

			exports.validateArray = (val, field, details) => {
			  exports.validateRequired(val, field, details);
			  if (!_.isArray(val)) {
			    throw HttpZError.get(`${field} must be an array`, details)
			  }
			}; 
		} (validators));
		return validators;
	}

	var hasRequiredUtils;

	function requireUtils () {
		if (hasRequiredUtils) return utils;
		hasRequiredUtils = 1;
		(function (exports) {
			const _ = require$$0;
			const validators = requireValidators();

			exports.splitByDelimiter = (str, delimiter) => {
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

			exports.isAbsoluteUrl = url => {
			  // Don't match Windows paths `c:\`
			  if (/^[a-zA-Z]:\\/.test(url)) {
			    return false
			  }

			  // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
			  // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
			  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)
			};

			exports.parseUrl = (url, host) => {
			  if (!host) {
			    host = url;
			    url = null;
			  }
			  const supportedProtocols = ['http', 'https'];
			  if (!_.find(supportedProtocols, known => _.startsWith(host, known + '://'))) {
			    host = 'http://' + host;
			  }

			  let parsedUrl = url ? new URL(url, host) : new URL(host);
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

			exports.convertParamsArrayToPairs = params => {
			  validators.validateArray(params, 'params');

			  return _.map(params, ({ name, value }) => [name, exports.getEmptyStringForUndefined(value)])
			};

			exports.prettifyHeaderName = name => {
			  return _.chain(name).split('-').map(_.capitalize).join('-').value()
			};

			exports.getEmptyStringForUndefined = val => {
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

			exports.getLibVersion = () => {
			  return '7.1.3'
			}; 
		} (utils));
		return utils;
	}

	var formDataParamParser;
	var hasRequiredFormDataParamParser;

	function requireFormDataParamParser () {
		if (hasRequiredFormDataParamParser) return formDataParamParser;
		hasRequiredFormDataParamParser = 1;
		const _ = require$$0;
		const consts = requireConsts();
		const utils = requireUtils();
		const HttpZError = requireError();

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
		    this.paramGroup = this.paramGroup.replace(consts.regexps.startNl, '').replace(consts.regexps.endNl, '');

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
		      throw HttpZError.get('Incorrect Content-Disposition', this.paramGroup)
		    }
		    this.paramGroup = this.paramGroup.replace(contentDisposition[0], '');
		    contentDisposition = _.trimEnd(contentDisposition[0], consts.EOL);
		    return contentDisposition
		  }

		  // TODO: test it
		  _getContentType() {
		    let contentType = this.paramGroup.match(consts.regexps.contentType);
		    if (contentType) {
		      this.paramGroup = this.paramGroup.replace(contentType[0], '');
		      return _.chain(contentType)
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
		      throw HttpZError.get('Incorrect Content-Disposition type', contentDisposition)
		    }
		    dispositionType = _.chain(dispositionType[0]).trim().toLower().value();
		    return dispositionType
		  }

		  // TODO: test it
		  _getParamName(contentDisposition) {
		    let paramName = contentDisposition.match(consts.regexps.dispositionName);
		    if (!paramName) {
		      throw HttpZError.get('Incorrect Content-Disposition, expected param name', contentDisposition)
		    }
		    paramName = _.trim(paramName, '"');
		    return paramName
		  }

		  // TODO: test it
		  _getFileName(contentDisposition) {
		    let fileName = contentDisposition.match(consts.regexps.dispositionFileName);
		    if (fileName) {
		      return _.trim(fileName, '"')
		    }
		  }

		  // TODO: test it
		  _getParamValue() {
		    let value;
		    if (this.paramGroup.match(consts.regexps.startNl)) {
		      value = this.paramGroup.replace(consts.regexps.startNl, '');
		    } else {
		      throw HttpZError.get('Incorrect form-data parameter', this.paramGroup)
		    }
		    return value
		  }
		}

		formDataParamParser = FormDataParamParser;
		return formDataParamParser;
	}

	var base$1;
	var hasRequiredBase$1;

	function requireBase$1 () {
		if (hasRequiredBase$1) return base$1;
		hasRequiredBase$1 = 1;
		const _ = require$$0;
		const consts = requireConsts();
		const HttpZError = requireError();
		const utils = requireUtils();
		const formDataParamParser = requireFormDataParamParser();

		class HttpZBaseParser {
		  constructor(rawMessage) {
		    this.rawMessage = rawMessage;
		  }

		  _parseMessageForRows() {
		    let [headers, body] = utils.splitByDelimiter(this.rawMessage, consts.EOL2X);
		    if (_.isNil(headers) || _.isNil(body)) {
		      throw HttpZError.get(
		        'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]'
		      )
		    }

		    this._calcSizes(headers, body);
		    let headerRows = _.split(headers, consts.EOL);

		    return {
		      startRow: _.head(headerRows),
		      headerRows: _.tail(headerRows),
		      bodyRows: body
		    }
		  }

		  _parseHeaderRows() {
		    this.headers = _.map(this.headerRows, hRow => {
		      let [name, value] = utils.splitByDelimiter(hRow, ':');
		      if (!name) {
		        throw HttpZError.get('Incorrect header row format, expected: Name: Value', hRow)
		      }

		      // quoted string must be parsed as a single value (https://tools.ietf.org/html/rfc7230#section-3.2.6)
		      if (_.isNil(value)) {
		        value = '';
		      } else if (consts.regexps.quoutedHeaderValue.test(value)) {
		        value = _.trim(value, '"');
		      }

		      return {
		        name: utils.prettifyHeaderName(name),
		        value
		      }
		    });
		  }

		  _parseBodyRows() {
		    if (!this.bodyRows) {
		      return
		    }

		    this._processTransferEncodingChunked();

		    this.body = {};
		    let contentTypeHeader = this._getContentTypeValue();
		    if (contentTypeHeader) {
		      this.body.contentType = contentTypeHeader.toLowerCase().split(';')[0];
		    }
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

		  // eslint-disable-next-line max-statements
		  _processTransferEncodingChunked() {
		    const isChunked = this.headers.find(
		      h => h.name === consts.http.headers.transferEncoding && h.value.includes('chunked')
		    );
		    if (!isChunked) {
		      return
		    }

		    let text = this.bodyRows;
		    const buffer = [];
		    do {
		      const rows = text.match(consts.regexps.chunkRow);
		      const firstRow = rows ? rows[0] : '';
		      const chunkLength = +('0x' + firstRow || '').trim();
		      if (!chunkLength) {
		        throw HttpZError.get('Incorrect row, expected: NumberEOL', this.bodyRows)
		      }
		      text = text.slice(firstRow.length);
		      const chunk = text.slice(0, chunkLength);
		      buffer.push(chunk);
		      text = text.slice(chunkLength + consts.EOL.length);
		    } while (text)

		    this.bodyRows = buffer.join('');
		  }

		  _parseFormDataBody() {
		    this.body.boundary = this._getBoundary();
		    this.body.params = _.chain(this.bodyRows)
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

		  _getContentTypeValue() {
		    let contentTypeHeader = _.find(this.headers, { name: consts.http.headers.contentType });
		    if (!contentTypeHeader) {
		      return
		    }
		    if (!contentTypeHeader.value) {
		      return
		    }
		    return contentTypeHeader.value
		  }

		  _getBoundary() {
		    let contentTypeValue = this._getContentTypeValue();
		    if (!contentTypeValue) {
		      throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary')
		    }

		    let params = contentTypeValue.split(';')[1];
		    if (!params) {
		      throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary')
		    }

		    let boundary = params.match(consts.regexps.boundary);
		    if (!boundary) {
		      throw HttpZError.get('Incorrect boundary, expected: boundary=value', params)
		    }
		    return _.trim(boundary[0], '"')
		  }
		}

		base$1 = HttpZBaseParser;
		return base$1;
	}

	var request$1;
	var hasRequiredRequest$1;

	function requireRequest$1 () {
		if (hasRequiredRequest$1) return request$1;
		hasRequiredRequest$1 = 1;
		const _ = require$$0;
		const consts = requireConsts();
		const HttpZError = requireError();
		const utils = requireUtils();
		const validators = requireValidators();
		const Base = requireBase$1();

		const SUPER_RANDOM_HOST = 'superrandomhost28476561927456.com';

		class HttpZRequestParser extends Base {
		  static parse(...params) {
		    let instance = new HttpZRequestParser(...params);
		    return instance.parse()
		  }

		  constructor(rawMessage, opts) {
		    super(rawMessage);
		    this.opts = opts;
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
		    this.hostRow = _.find(headerRows, row => _.chain(row).toLower().startsWith('host:').value());
		    this.headerRows = headerRows;
		    this.cookiesRow = _.find(headerRows, row => _.chain(row).toLower().startsWith('cookie:').value());
		    this.bodyRows = bodyRows;
		  }

		  _parseHostRow() {
		    if (this.opts.mandatoryHost) {
		      validators.validateNotEmptyString(this.hostRow, 'host header');
		    }
		    // eslint-disable-next-line no-unused-vars
		    let [unused, value] = utils.splitByDelimiter(this.hostRow || '', ':');
		    if (this.opts.mandatoryHost) {
		      validators.validateNotEmptyString(value, 'host header value');
		    }

		    this.host = value;
		  }

		  _parseStartRow() {
		    if (!consts.regexps.requestStartRow.test(this.startRow)) {
		      throw HttpZError.get('Incorrect startRow format, expected: Method request-target HTTP-Version', this.startRow)
		    }

		    let rowElems = this.startRow.split(' ');
		    this.method = rowElems[0].toUpperCase();
		    this.protocolVersion = rowElems[2].toUpperCase();
		    this.target = rowElems[1];

		    let parsedUrl = _.attempt(utils.parseUrl.bind(null, this.target, SUPER_RANDOM_HOST));
		    if (_.isError(parsedUrl)) {
		      throw HttpZError.get('Invalid target', this.target)
		    }

		    if (!this.host) {
		      this.host = parsedUrl.host !== SUPER_RANDOM_HOST ? parsedUrl.host : 'unspecified-host';
		    }
		    this.path = parsedUrl.path;
		    this.queryParams = parsedUrl.params;
		  }

		  _parseCookiesRow() {
		    if (!this.cookiesRow) {
		      return
		    }

		    let [cookieHeaderName, values] = utils.splitByDelimiter(this.cookiesRow, ':');
		    if (!cookieHeaderName) {
		      throw HttpZError.get('Incorrect cookie row format, expected: Cookie: Name1=Value1;...', this.cookiesRow)
		    }
		    if (!values) {
		      this.cookies = [];
		      return
		    }
		    this.cookies = _.chain(values)
		      .split(';')
		      .map(pair => {
		        let [name, value] = utils.splitByDelimiter(pair, '=');
		        let cookie = {
		          name
		        };
		        if (value) {
		          cookie.value = value;
		        }
		        if (!cookie.name) {
		          throw HttpZError.get('Incorrect cookie pair format, expected: Name1=Value1;...', values)
		        }
		        return cookie
		      })
		      .value();
		  }

		  _generateModel() {
		    let model = {
		      method: this.method,
		      protocolVersion: this.protocolVersion,
		      target: this.target,
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

		request$1 = HttpZRequestParser;
		return request$1;
	}

	var response$1;
	var hasRequiredResponse$1;

	function requireResponse$1 () {
		if (hasRequiredResponse$1) return response$1;
		hasRequiredResponse$1 = 1;
		const _ = require$$0;
		const consts = requireConsts();
		const HttpZError = requireError();
		const utils = requireUtils();
		const Base = requireBase$1();

		class HttpZResponseParser extends Base {
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
		    this.headerRows = headerRows;
		    this.cookieRows = _.filter(headerRows, row => _.chain(row).toLower().startsWith('set-cookie').value());
		    this.bodyRows = bodyRows;
		  }

		  _parseStartRow() {
		    if (!consts.regexps.responseStartRow.test(this.startRow)) {
		      throw HttpZError.get('Incorrect startRow format, expected: HTTP-Version status-code reason-phrase', this.startRow)
		    }

		    let rowElems = this.startRow.split(' ');
		    this.protocolVersion = rowElems[0].toUpperCase();
		    this.statusCode = +rowElems[1];
		    this.statusMessage = rowElems.splice(2).join(' ');
		  }

		  _parseCookieRows() {
		    if (_.isEmpty(this.cookieRows)) {
		      return
		    }

		    // eslint-disable-next-line max-statements
		    this.cookies = _.map(this.cookieRows, cookiesRow => {
		      // eslint-disable-next-line no-unused-vars
		      let [unused, values] = utils.splitByDelimiter(cookiesRow, ':');
		      if (!values) {
		        return {}
		      }
		      let params = _.split(values, ';');
		      let paramWithName = _.head(params);
		      let otherParams = _.tail(params);

		      let [name, value] = _.split(paramWithName, '=');
		      name = _.trim(name);
		      value = _.trim(value);
		      if (!name) {
		        throw HttpZError.get('Incorrect set-cookie pair format, expected: Name1=Value1;...', values)
		      }

		      let cookie = {
		        name
		      };
		      if (value) {
		        cookie.value = value;
		      }
		      if (otherParams.length > 0) {
		        cookie.params = _.map(otherParams, p => _.trim(p));
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

		response$1 = HttpZResponseParser;
		return response$1;
	}

	var parsers;
	var hasRequiredParsers;

	function requireParsers () {
		if (hasRequiredParsers) return parsers;
		hasRequiredParsers = 1;
		const _ = require$$0;
		const consts = requireConsts();
		const HttpZError = requireError();
		const RequestParser = requireRequest$1();
		const ResponseParser = requireResponse$1();

		parsers = (rawMessage, opts = {}) => {
		  if (_.isNil(rawMessage)) {
		    throw HttpZError.get('rawMessage is required')
		  }
		  if (!_.isString(rawMessage)) {
		    throw HttpZError.get('rawMessage must be a string')
		  }

		  let firstRow = _.chain(rawMessage).split(consts.EOL).head().value();
		  if (consts.regexps.requestStartRow.test(firstRow)) {
		    return RequestParser.parse(rawMessage, opts)
		  }
		  if (consts.regexps.responseStartRow.test(firstRow)) {
		    return ResponseParser.parse(rawMessage)
		  }
		  throw HttpZError.get('rawMessage has incorrect format')
		};
		return parsers;
	}

	var base;
	var hasRequiredBase;

	function requireBase () {
		if (hasRequiredBase) return base;
		hasRequiredBase = 1;
		const _ = require$$0;
		const consts = requireConsts();
		const utils = requireUtils();
		const validators = requireValidators();

		class HttpZBaseBuilder {
		  constructor({ headers, body }) {
		    this.headers = headers;
		    this.body = body;
		  }

		  _generateHeaderRows() {
		    validators.validateArray(this.headers, 'headers');

		    if (_.isEmpty(this.headers)) {
		      return ''
		    }

		    let headerRowsStr = _.chain(this.headers)
		      .map((header, index) => {
		        validators.validateNotEmptyString(header.name, 'header name', `header index: ${index}`);
		        validators.validateString(header.value, 'header.value', `header index: ${index}`);

		        let headerName = utils.prettifyHeaderName(header.name);
		        let headerValue = header.value;

		        return headerName + ': ' + headerValue
		      })
		      .join(consts.EOL)
		      .value();

		    return headerRowsStr + consts.EOL
		  }

		  _generateBodyRows() {
		    if (_.isEmpty(this.body)) {
		      return ''
		    }

		    this._processTransferEncodingChunked();

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

		  _processTransferEncodingChunked() {
		    const isChunked = this.headers.find(
		      h => h.name === consts.http.headers.transferEncoding && h.value.includes('chunked')
		    );
		    if (!isChunked) {
		      return
		    }

		    const body = utils.getEmptyStringForUndefined(this.body.text);
		    const defChunkLength = 25;
		    const buffer = [];
		    let index = 0;
		    while (index < body.length) {
		      const chunk = body.slice(index, index + defChunkLength);
		      buffer.push(chunk.length.toString(16).toUpperCase());
		      buffer.push(chunk);
		      index += defChunkLength;
		    }
		    this.body.text = buffer.join(consts.EOL);
		  }

		  _generateFormDataBody() {
		    validators.validateArray(this.body.params, 'body.params');
		    validators.validateNotEmptyString(this.body.boundary, 'body.boundary');

		    if (_.isEmpty(this.body.params)) {
		      return ''
		    }

		    // eslint-disable-next-line max-statements
		    let paramsStr = _.map(this.body.params, (param, index) => {
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

		base = HttpZBaseBuilder;
		return base;
	}

	var request;
	var hasRequiredRequest;

	function requireRequest () {
		if (hasRequiredRequest) return request;
		hasRequiredRequest = 1;
		const _ = require$$0;
		const consts = requireConsts();
		const validators = requireValidators();
		const utils = requireUtils();
		const HttpZError = requireError();
		const Base = requireBase();

		class HttpZRequestBuilder extends Base {
		  static build(...params) {
		    let instance = new HttpZRequestBuilder(...params);
		    return instance.build()
		  }

		  constructor({ method, protocolVersion, target, headers, body }, opts) {
		    super({ headers, body });
		    this.method = method;
		    this.protocolVersion = protocolVersion;
		    this.target = target;
		    this.opts = opts;
		  }

		  build() {
		    return '' + this._generateStartRow() + this._generateHeaderRows() + consts.EOL + this._generateBodyRows()
		  }

		  _generateStartRow() {
		    validators.validateNotEmptyString(this.method, 'method');
		    validators.validateNotEmptyString(this.protocolVersion, 'protocolVersion');
		    validators.validateNotEmptyString(this.target, 'target');

		    return '' + this.method.toUpperCase() + ' ' + this.target + ' ' + this.protocolVersion.toUpperCase() + consts.EOL
		  }

		  _generateHeaderRows() {
		    validators.validateArray(this.headers, 'headers');
		    if (this.opts.mandatoryHost) {
		      let hostHeader = _.find(this.headers, name => utils.prettifyHeaderName(name) === consts.http.headers.host);
		      if (!hostHeader) {
		        throw HttpZError.get('Host header is required')
		      }
		    }

		    return super._generateHeaderRows()
		  }
		}

		request = HttpZRequestBuilder;
		return request;
	}

	var response;
	var hasRequiredResponse;

	function requireResponse () {
		if (hasRequiredResponse) return response;
		hasRequiredResponse = 1;
		const consts = requireConsts();
		const validators = requireValidators();
		const Base = requireBase();

		class HttpZResponseBuilder extends Base {
		  static build(...params) {
		    let instance = new HttpZResponseBuilder(...params);
		    return instance.build()
		  }

		  constructor({ protocolVersion, statusCode, statusMessage, headers, body }) {
		    super({ headers, body });
		    this.protocolVersion = protocolVersion;
		    this.statusCode = statusCode;
		    this.statusMessage = statusMessage;
		  }

		  build() {
		    return '' + this._generateStartRow() + this._generateHeaderRows() + consts.EOL + this._generateBodyRows()
		  }

		  _generateStartRow() {
		    validators.validateNotEmptyString(this.protocolVersion, 'protocolVersion');
		    validators.validatePositiveNumber(this.statusCode, 'statusCode');
		    validators.validateNotEmptyString(this.statusMessage, 'statusMessage');

		    let protocolVersion = this.protocolVersion.toUpperCase();
		    return `${protocolVersion} ${this.statusCode} ${this.statusMessage}` + consts.EOL
		  }
		}

		response = HttpZResponseBuilder;
		return response;
	}

	var builders;
	var hasRequiredBuilders;

	function requireBuilders () {
		if (hasRequiredBuilders) return builders;
		hasRequiredBuilders = 1;
		const _ = require$$0;
		const HttpZError = requireError();
		const RequestBuilder = requireRequest();
		const ResponseBuilder = requireResponse();

		builders = (messageModel, opts = {}) => {
		  if (_.isNil(messageModel)) {
		    throw HttpZError.get('messageModel is required')
		  }
		  if (!_.isPlainObject(messageModel)) {
		    throw HttpZError.get('messageModel must be a plain object')
		  }
		  if (messageModel.method) {
		    return RequestBuilder.build(messageModel, opts)
		  }
		  if (messageModel.statusCode) {
		    return ResponseBuilder.build(messageModel)
		  }
		  throw HttpZError.get('messageModel has incorrect format')
		};
		return builders;
	}

	var httpZ;
	var hasRequiredHttpZ;

	function requireHttpZ () {
		if (hasRequiredHttpZ) return httpZ;
		hasRequiredHttpZ = 1;
		httpZ = {
		  consts: requireConsts(),
		  HttpZError: requireError(),
		  utils: requireUtils(),
		  parse: requireParsers(),
		  build: requireBuilders()
		};
		return httpZ;
	}

	var httpZExports = requireHttpZ();
	var index = /*@__PURE__*/getDefaultExportFromCjs(httpZExports);

	return index;

}));
