(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.httpZ = factory());
})(this, (function () { 'use strict';

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
		  'i',
		);
		regexps.contentType = new RegExp(`^Content-Type:[\\S ]*${EOL}`, 'i');
		regexps.contentDispositionType = /(?<=Content-Disposition:) *(form-data|inline|attachment)/;
		regexps.dispositionName = new RegExp(`(?<=name=)"${PARAM_NAME}+"`, 'i');
		regexps.dispositionFileName = new RegExp(`(?<=filename=)"${PARAM_NAME}+"`, 'i');
		regexps.chunkRow = new RegExp(`^[0-9a-fA-F]+${EOL}`);

		const http = {};

		http.protocols = {
		  http: 'HTTP',
		  https: 'HTTPS',
		};

		http.protocolVersions = {
		  http10: 'HTTP/1.0',
		  http11: 'HTTP/1.1',
		  http20: 'HTTP/2.0',
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
		  delete: 'DELETE',
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
		    xml: 'text/xml',
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
		    zip: 'application/zip',
		  },
		  multipart: {
		    any: 'multipart/',
		    alternative: 'multipart/alternative',
		    formData: 'multipart/form-data',
		    mixed: 'multipart/mixed',
		    related: 'multipart/related',
		  },
		  image: {
		    any: 'image/',
		    gif: 'image/gif',
		    jpeg: 'image/jpeg',
		    png: 'image/png',
		    tiff: 'image/tiff',
		    icon: 'image/x-icon',
		  },
		  audio: {
		    any: 'audio/',
		  },
		  video: {
		    any: 'audio/',
		  },
		  font: {
		    any: 'font/',
		  },
		};

		http.headers = {
		  host: 'Host',
		  contentType: 'Content-Type',
		  contentLength: 'Content-Length',
		  userAgent: 'User-Agent',
		  setCookie: 'Set-Cookie',
		  transferEncoding: 'Transfer-Encoding',
		};

		consts = {
		  EOL,
		  EOL2X,
		  regexps,
		  http,
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

	var hasRequiredUtils;

	function requireUtils () {
		if (hasRequiredUtils) return utils;
		hasRequiredUtils = 1;
		(function (exports) {
			exports.getLibVersion = () => {
			  return '8.0.0-dev'
			};

			exports.splitBy = (str, delimiter) => {
			  if (exports.isEmpty(str)) {
			    return []
			  }

			  const delimiterIndex = str.indexOf(delimiter);
			  if (delimiterIndex === -1) {
			    return []
			  }

			  const result = [str.slice(0, delimiterIndex), str.slice(delimiterIndex + delimiter.length)];
			  result[0] = result[0].trim(' ');
			  result[1] = result[1].trim(' ');

			  return result
			};

			exports.isAbsoluteUrl = (url) => {
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
			  if (!supportedProtocols.some((known) => host.startsWith(known + '://'))) {
			    host = 'http://' + host;
			  }

			  const parsedUrl = url ? new URL(url, host) : new URL(host);
			  const protocol = parsedUrl.protocol.replace(':', '').toUpperCase();
			  const params = [];
			  parsedUrl.searchParams.forEach((value, name) => params.push({ name, value }));

			  return {
			    protocol,
			    host: parsedUrl.host,
			    path: parsedUrl.pathname,
			    params,
			  }
			};

			exports.arrayToPairs = (params) => {
			  return params.map(({ name, value }) => [name, exports.getEmptyStringForUndefined(value)])
			};

			exports.prettifyHeaderName = (name) => {
			  return (name ?? '').toString().split('-').map(exports.capitalize).join('-')
			};

			exports.getEmptyStringForUndefined = (val) => {
			  if (exports.isUndefined(val)) {
			    return ''
			  }
			  return val
			};

			exports.extendIfNotUndefined = (obj, fieldName, fieldValue) => {
			  if (!exports.isUndefined(fieldValue)) {
			    obj[fieldName] = fieldValue;
			  }
			};

			// **********************
			// Lodash native replaces
			exports.isUndefined = (value) => {
			  return value === undefined
			};

			exports.isNil = (value) => {
			  return value == null
			};

			exports.isEmpty = (value) => {
			  if (value?.length || value?.size) {
			    return false
			  }
			  if (typeof value !== 'object') {
			    return true
			  }
			  for (const key in value) {
			    if (Object.hasOwn(value, key)) {
			      return false
			    }
			  }
			  return true
			};

			exports.isString = (value) => {
			  return typeof value === 'string'
			};

			exports.isNumber = (value) => {
			  return typeof value === 'number'
			};

			exports.isArray = (value) => {
			  return Array.isArray(value)
			};

			exports.isError = (value) => {
			  return value instanceof Error
			};

			exports.isPlainObject = (value) => {
			  if (typeof value !== 'object' || value === null) {
			    return false
			  }
			  if (Object.prototype.toString.call(value) !== '[object Object]') {
			    return false
			  }
			  const proto = Object.getPrototypeOf(value);
			  if (proto === null) {
			    return true
			  }

			  const Ctor = Object.prototype.hasOwnProperty.call(proto, 'constructor') && proto.constructor;
			  return (
			    typeof Ctor === 'function' &&
			    Ctor instanceof Ctor &&
			    Function.prototype.call(Ctor) === Function.prototype.call(value)
			  )
			};

			exports.capitalize = (value) => {
			  return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''
			};

			exports.head = (value) => {
			  // eslint-disable-next-line no-unused-vars
			  const [head, ...tail] = value;
			  return head
			};

			exports.tail = (value) => {
			  // eslint-disable-next-line no-unused-vars
			  const [head, ...tail] = value;
			  return tail
			};

			exports.trim = (value, chars = undefined) => {
			  if (exports.isNil(value)) {
			    return value
			  }
			  value = value.toString();
			  if (chars === undefined || chars === '\\s') {
			    return value.trim()
			  }
			  return value.replace(new RegExp(`^([${chars}]*)(.*?)([${chars}]*)$`), '$2')
			};

			exports.trimEnd = (value, chars = undefined) => {
			  if (exports.isNil(value)) {
			    return value
			  }
			  value = value.toString();
			  if (chars === undefined || chars === '\\s') {
			    return value.trimEnd()
			  }
			  return value.replace(new RegExp(`^(.*?)([${chars}]*)$`), '$1')
			}; 
		} (utils));
		return utils;
	}

	var assertions = {};

	var hasRequiredAssertions;

	function requireAssertions () {
		if (hasRequiredAssertions) return assertions;
		hasRequiredAssertions = 1;
		(function (exports) {
			const { isNil, isString, isEmpty, isNumber, isArray } = requireUtils();
			const HttpZError = requireError();

			exports.assertRequired = (val, field, details) => {
			  if (isNil(val)) {
			    throw HttpZError.get(`${field} is required`, details)
			  }
			};

			exports.assertString = (val, field, details) => {
			  exports.assertRequired(val, field, details);
			  if (!isString(val)) {
			    throw HttpZError.get(`${field} must be a string`, details)
			  }
			};

			exports.assertNotEmptyString = (val, field, details) => {
			  exports.assertString(val, field, details);
			  if (isEmpty(val)) {
			    throw HttpZError.get(`${field} must be not empty string`, details)
			  }
			};

			exports.assertNumber = (val, field, details) => {
			  exports.assertRequired(val, field, details);
			  if (!isNumber(val)) {
			    throw HttpZError.get(`${field} must be a number`, details)
			  }
			};

			exports.assertPositiveNumber = (val, field, details) => {
			  exports.assertNumber(val, field, details);
			  if (val <= 0) {
			    throw HttpZError.get(`${field} must be a positive number`, details)
			  }
			};

			exports.assertArray = (val, field, details) => {
			  exports.assertRequired(val, field, details);
			  if (!isArray(val)) {
			    throw HttpZError.get(`${field} must be an array`, details)
			  }
			}; 
		} (assertions));
		return assertions;
	}

	var formDataParamParser;
	var hasRequiredFormDataParamParser;

	function requireFormDataParamParser () {
		if (hasRequiredFormDataParamParser) return formDataParamParser;
		hasRequiredFormDataParamParser = 1;
		const consts = requireConsts();
		const { extendIfNotUndefined, trim, trimEnd } = requireUtils();
		const HttpZError = requireError();

		class FormDataParamParser {
		  // TODO: test it
		  static parse(...params) {
		    const instance = new FormDataParamParser(...params);
		    return instance.parse()
		  }

		  constructor(paramGroup) {
		    this.paramGroup = paramGroup;
		  }

		  // TODO: test it
		  parse() {
		    this.paramGroup = this.paramGroup.replace(consts.regexps.startNl, '').replace(consts.regexps.endNl, '');

		    const contentDispositionHeader = this._getContentDisposition();
		    const contentType = this._getContentType();
		    const dispositionType = this._getDispositionType(contentDispositionHeader);
		    const name = dispositionType === 'form-data' ? this._getParamName(contentDispositionHeader) : undefined;
		    const fileName = this._getFileName(contentDispositionHeader);
		    const value = this._getParamValue();

		    const param = {
		      value,
		    };
		    if (dispositionType !== 'form-data') {
		      param.type = dispositionType;
		    }
		    extendIfNotUndefined(param, 'contentType', contentType);
		    extendIfNotUndefined(param, 'name', name);
		    extendIfNotUndefined(param, 'fileName', fileName);

		    return param
		  }

		  // TODO: test it
		  _getContentDisposition() {
		    const contentDisposition = this.paramGroup.match(consts.regexps.contentDisposition);
		    if (!contentDisposition) {
		      throw HttpZError.get('Incorrect Content-Disposition', this.paramGroup)
		    }
		    this.paramGroup = this.paramGroup.replace(contentDisposition[0], '');
		    return trimEnd(contentDisposition[0], consts.EOL)
		  }

		  // TODO: test it
		  _getContentType() {
		    const contentType = this.paramGroup.match(consts.regexps.contentType);
		    if (contentType) {
		      this.paramGroup = this.paramGroup.replace(contentType[0], '');
		      return contentType
		        .toString()
		        .toLowerCase()
		        .replace(/^content-type: */, '')
		        .trimEnd(consts.EOL)
		    }
		  }

		  // TODO: test it
		  _getDispositionType(contentDisposition) {
		    const dispositionType = contentDisposition.match(consts.regexps.contentDispositionType);
		    if (!dispositionType) {
		      throw HttpZError.get('Incorrect Content-Disposition type', contentDisposition)
		    }
		    return dispositionType[0].trim().toLowerCase()
		  }

		  // TODO: test it
		  _getParamName(contentDisposition) {
		    const paramName = contentDisposition.match(consts.regexps.dispositionName);
		    if (!paramName) {
		      throw HttpZError.get('Incorrect Content-Disposition, expected param name', contentDisposition)
		    }
		    return trim(paramName, '"')
		  }

		  // TODO: test it
		  _getFileName(contentDisposition) {
		    const fileName = contentDisposition.match(consts.regexps.dispositionFileName);
		    if (fileName) {
		      return trim(fileName, '"')
		    }
		  }

		  // TODO: test it
		  _getParamValue() {
		    if (this.paramGroup.match(consts.regexps.startNl)) {
		      return this.paramGroup.replace(consts.regexps.startNl, '')
		    }
		    throw HttpZError.get('Incorrect form-data parameter', this.paramGroup)
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
		const consts = requireConsts();
		const HttpZError = requireError();
		const { isNil, trim } = requireUtils();
		const { splitBy, prettifyHeaderName, head, tail } = requireUtils();
		const formDataParamParser = requireFormDataParamParser();

		class HttpZBaseParser {
		  constructor(rawMessage) {
		    this.rawMessage = rawMessage;
		  }

		  _parseMessageForRows() {
		    const [headers, body] = splitBy(this.rawMessage, consts.EOL2X);
		    if (isNil(headers) || isNil(body)) {
		      throw HttpZError.get(
		        'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]',
		      )
		    }

		    this._calcSizes(headers, body);
		    const headerRows = headers.split(consts.EOL);

		    return {
		      startRow: head(headerRows),
		      headerRows: tail(headerRows),
		      bodyRows: body,
		    }
		  }

		  _parseHeaderRows() {
		    this.headers = this.headerRows.map((hRow) => {
		      let [name, value] = splitBy(hRow, ':');
		      if (!name) {
		        throw HttpZError.get('Incorrect header row format, expected: Name: Value', hRow)
		      }

		      // quoted string must be parsed as a single value (https://tools.ietf.org/html/rfc7230#section-3.2.6)
		      if (isNil(value)) {
		        value = '';
		      } else if (consts.regexps.quoutedHeaderValue.test(value)) {
		        value = trim(value, '"');
		      }

		      return {
		        name: prettifyHeaderName(name),
		        value,
		      }
		    });
		  }

		  _parseBodyRows() {
		    if (!this.bodyRows) {
		      return
		    }

		    this._processTransferEncodingChunked();

		    this.body = {};
		    const contentTypeHeader = this._getContentTypeValue();
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
		      (h) => h.name === consts.http.headers.transferEncoding && h.value.includes('chunked'),
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
		    this.body.params = this.bodyRows
		      .split(`--${this.body.boundary}`)
		      // skip first and last items, which contains boundary
		      .filter((unused, index, params) => index > 0 && index < params.length - 1)
		      .map((paramGroup) => formDataParamParser.parse(paramGroup));
		  }

		  _parseUrlencodedBody() {
		    const params = new URLSearchParams(this.bodyRows);
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
		    const contentTypeHeader = (this.headers ?? []).find((h) => h.name === consts.http.headers.contentType);
		    if (!contentTypeHeader) {
		      return
		    }
		    if (!contentTypeHeader.value) {
		      return
		    }
		    return contentTypeHeader.value
		  }

		  _getBoundary() {
		    const contentTypeValue = this._getContentTypeValue();
		    if (!contentTypeValue) {
		      throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary')
		    }

		    const params = contentTypeValue.split(';')[1];
		    if (!params) {
		      throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary')
		    }

		    const boundary = params.match(consts.regexps.boundary);
		    if (!boundary) {
		      throw HttpZError.get('Incorrect boundary, expected: boundary=value', params)
		    }
		    return trim(boundary[0], '"')
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
		const consts = requireConsts();
		const HttpZError = requireError();
		const { splitBy, parseUrl } = requireUtils();
		const { assertNotEmptyString } = requireAssertions();
		const Base = requireBase$1();

		const SUPER_RANDOM_HOST = 'superrandomhost28476561927456.com';

		class HttpZRequestParser extends Base {
		  static parse(...params) {
		    const instance = new HttpZRequestParser(...params);
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
		    const { startRow, headerRows, bodyRows } = super._parseMessageForRows();

		    this.startRow = startRow;
		    this.hostRow = headerRows.find((row) => row.toLowerCase().startsWith('host:'));
		    this.headerRows = headerRows;
		    this.cookiesRow = headerRows.find((row) => row.toLowerCase().startsWith('cookie:'));
		    this.bodyRows = bodyRows;
		  }

		  _parseHostRow() {
		    if (this.opts.mandatoryHost) {
		      assertNotEmptyString(this.hostRow, 'host header');
		    }
		    // eslint-disable-next-line no-unused-vars
		    const [unused, value] = splitBy(this.hostRow || '', ':');
		    if (this.opts.mandatoryHost) {
		      assertNotEmptyString(value, 'host header value');
		    }

		    this.host = value;
		  }

		  // eslint-disable-next-line max-statements
		  _parseStartRow() {
		    if (!consts.regexps.requestStartRow.test(this.startRow)) {
		      throw HttpZError.get('Incorrect startRow format, expected: Method request-target HTTP-Version', this.startRow)
		    }

		    const rowElems = this.startRow.split(' ');
		    this.method = rowElems[0].toUpperCase();
		    this.protocolVersion = rowElems[2].toUpperCase();
		    this.target = rowElems[1];

		    let parsedUrl;
		    try {
		      parsedUrl = parseUrl(this.target, SUPER_RANDOM_HOST);
		    } catch (err) {
		      if (err.code === 'ERR_INVALID_URL') {
		        throw HttpZError.get('Invalid target', this.target)
		      }
		      throw err
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

		    const [cookieHeaderName, values] = splitBy(this.cookiesRow, ':');
		    if (!cookieHeaderName) {
		      throw HttpZError.get('Incorrect cookie row format, expected: Cookie: Name1=Value1;...', this.cookiesRow)
		    }
		    if (!values) {
		      this.cookies = [];
		      return
		    }
		    this.cookies = values.split(';').map((pair) => {
		      const [name, value] = splitBy(pair, '=');
		      const cookie = {
		        name,
		      };
		      if (value) {
		        cookie.value = value;
		      }
		      if (!cookie.name) {
		        throw HttpZError.get('Incorrect cookie pair format, expected: Name1=Value1;...', values)
		      }
		      return cookie
		    });
		  }

		  _generateModel() {
		    const model = {
		      method: this.method,
		      protocolVersion: this.protocolVersion,
		      target: this.target,
		      host: this.host,
		      path: this.path,
		      headersSize: this.headersSize,
		      bodySize: this.bodySize,
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
		const consts = requireConsts();
		const HttpZError = requireError();
		const { splitBy, head, tail, isEmpty } = requireUtils();
		const Base = requireBase$1();

		class HttpZResponseParser extends Base {
		  static parse(...params) {
		    const instance = new HttpZResponseParser(...params);
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
		    const { startRow, headerRows, bodyRows } = super._parseMessageForRows();

		    this.startRow = startRow;
		    this.headerRows = headerRows;
		    this.cookieRows = headerRows.filter((row) => row.toLowerCase().startsWith('set-cookie'));
		    this.bodyRows = bodyRows;
		  }

		  _parseStartRow() {
		    if (!consts.regexps.responseStartRow.test(this.startRow)) {
		      throw HttpZError.get('Incorrect startRow format, expected: HTTP-Version status-code reason-phrase', this.startRow)
		    }

		    const rowElems = this.startRow.split(' ');
		    this.protocolVersion = rowElems[0].toUpperCase();
		    this.statusCode = +rowElems[1];
		    this.statusMessage = rowElems.splice(2).join(' ');
		  }

		  _parseCookieRows() {
		    if (isEmpty(this.cookieRows)) {
		      return
		    }

		    // eslint-disable-next-line max-statements
		    this.cookies = this.cookieRows.map((cookiesRow) => {
		      // eslint-disable-next-line no-unused-vars
		      const [unused, values] = splitBy(cookiesRow, ':');
		      if (!values) {
		        return {}
		      }
		      const params = values.split(';');
		      const paramWithName = head(params);
		      const otherParams = tail(params);

		      let [name, value] = paramWithName.split('=');
		      name = name.trim();
		      value = value.trim();
		      if (!name) {
		        throw HttpZError.get('Incorrect set-cookie pair format, expected: Name1=Value1;...', values)
		      }

		      const cookie = {
		        name,
		      };
		      if (value) {
		        cookie.value = value;
		      }
		      if (otherParams.length > 0) {
		        cookie.params = otherParams.map((param) => param.trim());
		      }

		      return cookie
		    });
		  }

		  _generateModel() {
		    const model = {
		      protocolVersion: this.protocolVersion,
		      statusCode: this.statusCode,
		      statusMessage: this.statusMessage,
		      headersSize: this.headersSize,
		      bodySize: this.bodySize,
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
		const consts = requireConsts();
		const { head, isNil, isString } = requireUtils();
		const HttpZError = requireError();
		const RequestParser = requireRequest$1();
		const ResponseParser = requireResponse$1();

		parsers = (rawMessage, opts = {}) => {
		  if (isNil(rawMessage)) {
		    throw HttpZError.get('rawMessage is required')
		  }
		  if (!isString(rawMessage)) {
		    throw HttpZError.get('rawMessage must be a string')
		  }

		  const firstRow = head(rawMessage.split(consts.EOL));
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
		const { isEmpty } = requireUtils();
		const consts = requireConsts();
		const { prettifyHeaderName, getEmptyStringForUndefined, arrayToPairs } = requireUtils();
		const { assertArray, assertNotEmptyString, assertString } = requireAssertions();

		class HttpZBaseBuilder {
		  constructor({ headers, body }) {
		    this.headers = headers;
		    this.body = body;
		  }

		  _generateHeaderRows() {
		    assertArray(this.headers, 'headers');

		    if (isEmpty(this.headers)) {
		      return ''
		    }

		    const headerRowsStr = this.headers
		      .map((header, index) => {
		        assertNotEmptyString(header.name, 'header name', `header index: ${index}`);
		        assertString(header.value, 'header.value', `header index: ${index}`);

		        const headerName = prettifyHeaderName(header.name);
		        const headerValue = header.value;

		        return headerName + ': ' + headerValue
		      })
		      .join(consts.EOL);

		    return headerRowsStr + consts.EOL
		  }

		  _generateBodyRows() {
		    if (isEmpty(this.body)) {
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
		      (h) => h.name === consts.http.headers.transferEncoding && h.value.includes('chunked'),
		    );
		    if (!isChunked) {
		      return
		    }

		    const body = getEmptyStringForUndefined(this.body.text);
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
		    assertArray(this.body.params, 'body.params');
		    assertNotEmptyString(this.body.boundary, 'body.boundary');

		    if (isEmpty(this.body.params)) {
		      return ''
		    }

		    const paramsStr = this.body.params
		      // eslint-disable-next-line max-statements
		      .map((param, index) => {
		        if (!param.type) {
		          assertNotEmptyString(param.name, 'body.params[index].name', `param index: ${index}`);
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
		        paramGroupStr += getEmptyStringForUndefined(param.value);
		        paramGroupStr += consts.EOL;
		        return paramGroupStr
		      })
		      .join('');

		    return `${paramsStr}--${this.body.boundary}--`
		  }

		  _generateUrlencodedBody() {
		    assertArray(this.body.params, 'body.params');
		    const paramPairs = arrayToPairs(this.body.params);

		    return new URLSearchParams(paramPairs).toString()
		  }

		  _generateTextBody() {
		    return getEmptyStringForUndefined(this.body.text)
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
		const consts = requireConsts();
		const { assertArray, assertNotEmptyString } = requireAssertions();
		const { prettifyHeaderName } = requireUtils();
		const HttpZError = requireError();
		const Base = requireBase();

		class HttpZRequestBuilder extends Base {
		  static build(...params) {
		    const instance = new HttpZRequestBuilder(...params);
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
		    assertNotEmptyString(this.method, 'method');
		    assertNotEmptyString(this.protocolVersion, 'protocolVersion');
		    assertNotEmptyString(this.target, 'target');

		    return '' + this.method.toUpperCase() + ' ' + this.target + ' ' + this.protocolVersion.toUpperCase() + consts.EOL
		  }

		  _generateHeaderRows() {
		    assertArray(this.headers, 'headers');
		    if (this.opts.mandatoryHost) {
		      const hostHeader = this.headers.find((name) => prettifyHeaderName(name) === consts.http.headers.host);
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
		const { assertNotEmptyString, assertPositiveNumber } = requireAssertions();
		const Base = requireBase();

		class HttpZResponseBuilder extends Base {
		  static build(...params) {
		    const instance = new HttpZResponseBuilder(...params);
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
		    assertNotEmptyString(this.protocolVersion, 'protocolVersion');
		    assertPositiveNumber(this.statusCode, 'statusCode');
		    assertNotEmptyString(this.statusMessage, 'statusMessage');

		    const protocolVersion = this.protocolVersion.toUpperCase();
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
		const { isNil, isPlainObject } = requireUtils();
		const HttpZError = requireError();
		const RequestBuilder = requireRequest();
		const ResponseBuilder = requireResponse();

		builders = (messageModel, opts = {}) => {
		  if (isNil(messageModel)) {
		    throw HttpZError.get('messageModel is required')
		  }
		  if (!isPlainObject(messageModel)) {
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
