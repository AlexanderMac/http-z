(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.httpZ = {}));
})(this, (function (exports) { 'use strict';

    class HttpZError extends Error {
        static get(...params) {
            return new HttpZError(...params);
        }
        details;
        constructor(message, details) {
            super(message);
            this.name = this.constructor.name;
            this.details = details;
            if ('captureStackTrace' in Error) {
                Error.captureStackTrace(this, this.constructor);
            }
        }
    }

    const splitBy = (str, delimiter) => {
        if (isEmpty(str)) {
            return [];
        }
        const delimiterIndex = str.indexOf(delimiter);
        if (delimiterIndex === -1) {
            return [];
        }
        const result = [str.slice(0, delimiterIndex), str.slice(delimiterIndex + delimiter.length)];
        result[0] = result[0].trim();
        result[1] = result[1].trim();
        return result;
    };
    const isAbsoluteUrl = (url) => {
        if (/^[a-zA-Z]:\\/.test(url)) {
            return false;
        }
        return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
    };
    const parseUrl = (url, host) => {
        const supportedProtocols = ['http', 'https'];
        if (!supportedProtocols.some(known => host.startsWith(known + '://'))) {
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
        };
    };
    const arrayToPairs = (params) => {
        return params.map(({ name, value }) => [name, getEmptyStringForUndefined(value)]);
    };
    const prettifyHeaderName = (name) => {
        return (name ?? '').toString().split('-').map(capitalize).join('-');
    };
    const getEmptyStringForUndefined = (value) => {
        if (isUndefined(value)) {
            return '';
        }
        return value;
    };
    const extendIfNotUndefined = (obj, fieldName, fieldValue) => {
        if (!isUndefined(fieldValue)) {
            obj[fieldName] = fieldValue;
        }
    };
    const isUndefined = (value) => {
        return value === undefined;
    };
    const isNil = (value) => {
        return value == null;
    };
    const isEmpty = (value) => {
        if (isNil(value)) {
            return true;
        }
        if (value.length || value.size) {
            return false;
        }
        if (typeof value !== 'object') {
            return true;
        }
        for (const key in value) {
            if (Object.hasOwn(value, key)) {
                return false;
            }
        }
        return true;
    };
    const isString = (value) => {
        return typeof value === 'string';
    };
    const isNumber = (value) => {
        return typeof value === 'number';
    };
    const isArray = (value) => {
        return Array.isArray(value);
    };
    const isError = (value) => {
        return value instanceof Error;
    };
    const isPlainObject = (value) => {
        if (typeof value !== 'object' || value === null) {
            return false;
        }
        if (Object.prototype.toString.call(value) !== '[object Object]') {
            return false;
        }
        const proto = Object.getPrototypeOf(value);
        if (proto === null) {
            return true;
        }
        const Ctor = Object.prototype.hasOwnProperty.call(proto, 'constructor') && proto.constructor;
        return (typeof Ctor === 'function' &&
            Ctor instanceof Ctor &&
            Function.prototype.call(Ctor) === Function.prototype.call(value));
    };
    const capitalize = (value) => {
        return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
    };
    const head = (value) => {
        const [_head, ..._tail] = value;
        return _head;
    };
    const tail = (value) => {
        const [_head, ..._tail] = value;
        return _tail;
    };
    const trim = (value, chars = undefined) => {
        if (isNil(value)) {
            return value;
        }
        value = value.toString();
        if (chars === undefined || chars === '\\s') {
            return value.trim();
        }
        return value.replace(new RegExp(`^([${chars}]*)(.*?)([${chars}]*)$`), '$2');
    };
    const trimEnd = (value, chars = undefined) => {
        if (isNil(value)) {
            return value;
        }
        value = value.toString();
        if (chars === undefined || chars === '\\s') {
            return value.trimEnd();
        }
        return value.replace(new RegExp(`^(.*?)([${chars}]*)$`), '$1');
    };

    var utils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        arrayToPairs: arrayToPairs,
        capitalize: capitalize,
        extendIfNotUndefined: extendIfNotUndefined,
        getEmptyStringForUndefined: getEmptyStringForUndefined,
        head: head,
        isAbsoluteUrl: isAbsoluteUrl,
        isArray: isArray,
        isEmpty: isEmpty,
        isError: isError,
        isNil: isNil,
        isNumber: isNumber,
        isPlainObject: isPlainObject,
        isString: isString,
        isUndefined: isUndefined,
        parseUrl: parseUrl,
        prettifyHeaderName: prettifyHeaderName,
        splitBy: splitBy,
        tail: tail,
        trim: trim,
        trimEnd: trimEnd
    });

    const assertRequired = (val, field, details) => {
        if (isNil(val)) {
            throw HttpZError.get(`${field} is required`, details);
        }
    };
    const assertString = (val, field, details) => {
        assertRequired(val, field, details);
        if (!isString(val)) {
            throw HttpZError.get(`${field} must be a string`, details);
        }
    };
    const assertNotEmptyString = (val, field, details) => {
        assertString(val, field, details);
        if (isEmpty(val)) {
            throw HttpZError.get(`${field} must be not empty string`, details);
        }
    };
    const assertNumber = (val, field, details) => {
        assertRequired(val, field, details);
        if (!isNumber(val)) {
            throw HttpZError.get(`${field} must be a number`, details);
        }
    };
    const assertPositiveNumber = (val, field, details) => {
        assertNumber(val, field, details);
        if (val <= 0) {
            throw HttpZError.get(`${field} must be a positive number`, details);
        }
    };
    const assertArray = (val, field, details) => {
        assertRequired(val, field, details);
        if (!isArray(val)) {
            throw HttpZError.get(`${field} must be an array`, details);
        }
    };

    const EOL = '\r\n';
    const EOL2X = EOL + EOL;
    const HTTP_METHODS = '(CONNECT|OPTIONS|TRACE|GET|HEAD|POST|PUT|PATCH|DELETE)';
    const HTTP_PROTOCOL_VERSIONS = '(HTTP)\\/(1\\.0|1\\.1|2(\\.0){0,1}|3(\\.0){0,1})';
    const regexps = {
        quote: /"/g,
        nlStart: new RegExp(`^${EOL}`),
        nlEnd: new RegExp(`${EOL}$`),
        requestStartRow: new RegExp(`^${HTTP_METHODS}\\s\\S*\\s${HTTP_PROTOCOL_VERSIONS}$`),
        responseStartRow: new RegExp(`^${HTTP_PROTOCOL_VERSIONS}\\s\\d{3}\\s[^\r\n]*$`),
        quotedHeaderValue: new RegExp('^"[\\u0009\\u0020\\u0021\\u0023-\\u007E]+"$'),
        boundary: new RegExp(`(?<=boundary=)"{0,1}[A-Za-z0-9'()+_,.:=?-]+"{0,1}`),
        contentDisposition: new RegExp(`^Content-Disposition:\\s*(form-data|inline|attachment)(?:\\s*;\\s*(name|filename)\\s*=\\s*(?:"([^"]+)"|([^;\\s]+)))*${EOL}`, 'i'),
        contentType: new RegExp(`^Content-Type:[\\S ]*${EOL}`, 'i'),
        contentDispositionType: new RegExp(`(?<=Content-Disposition:)\\s*(form-data|inline|attachment)`),
        dispositionName: new RegExp(`(?<=name=)(?:"([^"]+)"|([^;\\s]+))+`, 'i'),
        dispositionFileName: new RegExp(`(?<=filename=)(?:"([^"]+)"|([^;\\s]+))+`, 'i'),
        chunkRow: new RegExp(`^[0-9a-fA-F]+${EOL}`),
    };
    var HttpProtocol;
    (function (HttpProtocol) {
        HttpProtocol["http"] = "HTTP";
        HttpProtocol["https"] = "HTTPS";
    })(HttpProtocol || (HttpProtocol = {}));
    var HttpProtocolVersion;
    (function (HttpProtocolVersion) {
        HttpProtocolVersion["http10"] = "HTTP/1.0";
        HttpProtocolVersion["http11"] = "HTTP/1.1";
        HttpProtocolVersion["http2"] = "HTTP/2";
        HttpProtocolVersion["http3"] = "HTTP/3";
    })(HttpProtocolVersion || (HttpProtocolVersion = {}));
    var HttpMethod;
    (function (HttpMethod) {
        HttpMethod["connect"] = "CONNECT";
        HttpMethod["options"] = "OPTIONS";
        HttpMethod["trace"] = "TRACE";
        HttpMethod["head"] = "HEAD";
        HttpMethod["get"] = "GET";
        HttpMethod["post"] = "POST";
        HttpMethod["put"] = "PUT";
        HttpMethod["patch"] = "PATCH";
        HttpMethod["delete"] = "DELETE";
    })(HttpMethod || (HttpMethod = {}));
    const HttpPostMethods = [HttpMethod.post, HttpMethod.put, HttpMethod.patch];
    var HttpHeader;
    (function (HttpHeader) {
        HttpHeader["host"] = "Host";
        HttpHeader["contentType"] = "Content-Type";
        HttpHeader["contentLength"] = "Content-Length";
        HttpHeader["userAgent"] = "User-Agent";
        HttpHeader["setCookie"] = "Set-Cookie";
        HttpHeader["transferEncoding"] = "Transfer-Encoding";
    })(HttpHeader || (HttpHeader = {}));
    var HttpContentTypeText;
    (function (HttpContentTypeText) {
        HttpContentTypeText["any"] = "text/";
        HttpContentTypeText["css"] = "text/css";
        HttpContentTypeText["csv"] = "text/csv";
        HttpContentTypeText["html"] = "text/html";
        HttpContentTypeText["javascript"] = "text/javascript";
        HttpContentTypeText["plain"] = "text/plain";
        HttpContentTypeText["xml"] = "text/xml";
    })(HttpContentTypeText || (HttpContentTypeText = {}));
    var HttpContentTypeApplication;
    (function (HttpContentTypeApplication) {
        HttpContentTypeApplication["any"] = "application/";
        HttpContentTypeApplication["javascript"] = "application/javascript";
        HttpContentTypeApplication["json"] = "application/json";
        HttpContentTypeApplication["octetStream"] = "application/octet-stream";
        HttpContentTypeApplication["ogg"] = "application/ogg";
        HttpContentTypeApplication["pdf"] = "application/pdf";
        HttpContentTypeApplication["xhtml"] = "application/xhtml+xml";
        HttpContentTypeApplication["xml"] = "application/xml";
        HttpContentTypeApplication["xShockwaveFlash"] = "application/x-shockwave-flash";
        HttpContentTypeApplication["xWwwFormUrlencoded"] = "application/x-www-form-urlencoded";
        HttpContentTypeApplication["zip"] = "application/zip";
    })(HttpContentTypeApplication || (HttpContentTypeApplication = {}));
    var HttpContentTypeMultipart;
    (function (HttpContentTypeMultipart) {
        HttpContentTypeMultipart["any"] = "multipart/";
        HttpContentTypeMultipart["alternative"] = "multipart/alternative";
        HttpContentTypeMultipart["formData"] = "multipart/form-data";
        HttpContentTypeMultipart["mixed"] = "multipart/mixed";
        HttpContentTypeMultipart["related"] = "multipart/related";
    })(HttpContentTypeMultipart || (HttpContentTypeMultipart = {}));
    var HttpContentTypeImage;
    (function (HttpContentTypeImage) {
        HttpContentTypeImage["any"] = "image/";
        HttpContentTypeImage["gif"] = "image/gif";
        HttpContentTypeImage["jpeg"] = "image/jpeg";
        HttpContentTypeImage["png"] = "image/png";
        HttpContentTypeImage["tiff"] = "image/tiff";
        HttpContentTypeImage["icon"] = "image/x-icon";
    })(HttpContentTypeImage || (HttpContentTypeImage = {}));
    var HttpContentTypeAudio;
    (function (HttpContentTypeAudio) {
        HttpContentTypeAudio["any"] = "audio/";
    })(HttpContentTypeAudio || (HttpContentTypeAudio = {}));
    var HttpContentTypeVideo;
    (function (HttpContentTypeVideo) {
        HttpContentTypeVideo["any"] = "video/";
    })(HttpContentTypeVideo || (HttpContentTypeVideo = {}));
    var HttpContentTypeFont;
    (function (HttpContentTypeFont) {
        HttpContentTypeFont["any"] = "font/";
    })(HttpContentTypeFont || (HttpContentTypeFont = {}));

    var constants = /*#__PURE__*/Object.freeze({
        __proto__: null,
        EOL: EOL,
        EOL2X: EOL2X,
        get HttpContentTypeApplication () { return HttpContentTypeApplication; },
        get HttpContentTypeAudio () { return HttpContentTypeAudio; },
        get HttpContentTypeFont () { return HttpContentTypeFont; },
        get HttpContentTypeImage () { return HttpContentTypeImage; },
        get HttpContentTypeMultipart () { return HttpContentTypeMultipart; },
        get HttpContentTypeText () { return HttpContentTypeText; },
        get HttpContentTypeVideo () { return HttpContentTypeVideo; },
        get HttpHeader () { return HttpHeader; },
        get HttpMethod () { return HttpMethod; },
        HttpPostMethods: HttpPostMethods,
        get HttpProtocol () { return HttpProtocol; },
        get HttpProtocolVersion () { return HttpProtocolVersion; },
        regexps: regexps
    });

    class HttpZBaseBuilder {
        headers;
        body;
        constructor(headers, body) {
            this.headers = headers;
            this.body = body;
        }
        _generateHeaderRows() {
            assertArray(this.headers, 'headers');
            if (isEmpty(this.headers)) {
                return '';
            }
            const headerRowsStr = this.headers
                .map((header, index) => {
                assertNotEmptyString(header.name, 'header name', `header index: ${index}`);
                assertString(header.value, 'header.value', `header index: ${index}`);
                const headerName = prettifyHeaderName(header.name);
                const headerValue = header.value;
                return headerName + ': ' + headerValue;
            })
                .join(EOL);
            return headerRowsStr + EOL;
        }
        _generateBodyRows() {
            if (isEmpty(this.body)) {
                return '';
            }
            this._processTransferEncodingChunked();
            switch (this.body.contentType) {
                case HttpContentTypeMultipart.formData:
                case HttpContentTypeMultipart.alternative:
                case HttpContentTypeMultipart.mixed:
                case HttpContentTypeMultipart.related:
                    return this._generateFormDataBody();
                case HttpContentTypeApplication.xWwwFormUrlencoded:
                    return this._generateUrlencodedBody();
                default:
                    return this._generateTextBody();
            }
        }
        _processTransferEncodingChunked() {
            const isChunked = this.headers.find(h => h.name === HttpHeader.transferEncoding.toString() && h.value.includes('chunked'));
            if (!isChunked) {
                return;
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
            this.body.text = buffer.join(EOL);
        }
        _generateFormDataBody() {
            assertArray(this.body.params, 'body.params');
            assertNotEmptyString(this.body.boundary, 'body.boundary');
            if (isEmpty(this.body.params)) {
                return '';
            }
            const paramsStr = this.body.params
                .map((param, index) => {
                if (!param.type) {
                    assertNotEmptyString(param.name, 'body.params[index].name', `param index: ${index}`);
                }
                let paramGroupStr = '--' + this.body.boundary;
                paramGroupStr += EOL;
                paramGroupStr += `Content-Disposition: ${param.type || 'form-data'}`;
                if (param.name) {
                    paramGroupStr += `; name="${param.name}"`;
                }
                if (param.fileName) {
                    paramGroupStr += `; filename="${param.fileName}"`;
                }
                paramGroupStr += EOL;
                if (param.contentType) {
                    paramGroupStr += `Content-Type: ${param.contentType}`;
                    paramGroupStr += EOL;
                }
                paramGroupStr += EOL;
                paramGroupStr += getEmptyStringForUndefined(param.value);
                paramGroupStr += EOL;
                return paramGroupStr;
            })
                .join('');
            return `${paramsStr}--${this.body.boundary}--`;
        }
        _generateUrlencodedBody() {
            assertArray(this.body.params, 'body.params');
            const paramPairs = arrayToPairs(this.body.params);
            return new URLSearchParams(paramPairs).toString();
        }
        _generateTextBody() {
            return getEmptyStringForUndefined(this.body.text);
        }
    }

    class HttpZRequestBuilder extends HttpZBaseBuilder {
        static build(...params) {
            const instance = new HttpZRequestBuilder(...params);
            return instance.build();
        }
        method;
        protocolVersion;
        target;
        opts;
        constructor(message, opts) {
            super(message.headers, message.body);
            this.method = message.method;
            this.protocolVersion = message.protocolVersion;
            this.target = message.target;
            this.opts = opts;
        }
        build() {
            return '' + this._generateStartRow() + this._generateHeaderRows() + EOL + this._generateBodyRows();
        }
        _generateStartRow() {
            assertNotEmptyString(this.method, 'method');
            assertNotEmptyString(this.protocolVersion, 'protocolVersion');
            assertNotEmptyString(this.target, 'target');
            return '' + this.method.toUpperCase() + ' ' + this.target + ' ' + this.protocolVersion.toUpperCase() + EOL;
        }
        _generateHeaderRows() {
            assertArray(this.headers, 'headers');
            if (this.opts.mandatoryHost) {
                const hostHeader = this.headers.find((h) => prettifyHeaderName(h.name) === HttpHeader.host.toString());
                if (!hostHeader) {
                    throw HttpZError.get('Host header is required');
                }
            }
            return super._generateHeaderRows();
        }
    }

    class HttpZResponseBuilder extends HttpZBaseBuilder {
        static build(...params) {
            const instance = new HttpZResponseBuilder(...params);
            return instance.build();
        }
        protocolVersion;
        statusCode;
        statusMessage;
        constructor(message) {
            super(message.headers, message.body);
            this.protocolVersion = message.protocolVersion;
            this.statusCode = message.statusCode;
            this.statusMessage = message.statusMessage;
        }
        build() {
            return '' + this._generateStartRow() + this._generateHeaderRows() + EOL + this._generateBodyRows();
        }
        _generateStartRow() {
            assertNotEmptyString(this.protocolVersion, 'protocolVersion');
            assertPositiveNumber(this.statusCode, 'statusCode');
            assertNotEmptyString(this.statusMessage, 'statusMessage');
            const protocolVersion = this.protocolVersion.toUpperCase();
            return `${protocolVersion} ${this.statusCode} ${this.statusMessage}` + EOL;
        }
    }

    function build(messageModel, opts = {}) {
        if (isNil(messageModel)) {
            throw HttpZError.get('messageModel is required');
        }
        if (!isPlainObject(messageModel)) {
            throw HttpZError.get('messageModel must be a plain object');
        }
        if ('method' in messageModel) {
            return HttpZRequestBuilder.build(messageModel, opts);
        }
        if ('statusCode' in messageModel) {
            return HttpZResponseBuilder.build(messageModel);
        }
        throw HttpZError.get('messageModel has incorrect format');
    }

    class FormDataParamParser {
        paramGroup;
        static parse(...params) {
            const instance = new FormDataParamParser(...params);
            return instance.parse();
        }
        constructor(paramGroup) {
            this.paramGroup = paramGroup;
        }
        parse() {
            this.paramGroup = this.paramGroup.replace(regexps.nlStart, '').replace(regexps.nlEnd, '');
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
            return param;
        }
        _getContentDisposition() {
            const contentDisposition = this.paramGroup.match(regexps.contentDisposition);
            if (contentDisposition) {
                this.paramGroup = this.paramGroup.replace(contentDisposition[0], '');
                return trimEnd(contentDisposition[0], EOL);
            }
            throw HttpZError.get('Incorrect Content-Disposition', this.paramGroup);
        }
        _getContentType() {
            const contentType = this.paramGroup.match(regexps.contentType);
            if (contentType) {
                this.paramGroup = this.paramGroup.replace(contentType[0], '');
                return trimEnd(contentType
                    .toString()
                    .toLowerCase()
                    .replace(/^content-type: */, ''), EOL);
            }
        }
        _getDispositionType(contentDisposition) {
            const dispositionType = contentDisposition.match(regexps.contentDispositionType);
            if (dispositionType) {
                return dispositionType[0].trim().toLowerCase();
            }
            throw HttpZError.get('Incorrect Content-Disposition type', contentDisposition);
        }
        _getParamName(contentDisposition) {
            const paramName = contentDisposition.match(regexps.dispositionName);
            if (paramName) {
                return trim(paramName[0], '"');
            }
            throw HttpZError.get('Incorrect Content-Disposition, expected param name', contentDisposition);
        }
        _getFileName(contentDisposition) {
            const fileName = contentDisposition.match(regexps.dispositionFileName);
            if (fileName) {
                return trim(fileName[0], '"');
            }
        }
        _getParamValue() {
            if (this.paramGroup.match(regexps.nlStart)) {
                return this.paramGroup.replace(regexps.nlStart, '');
            }
            throw HttpZError.get('Incorrect form-data parameter', this.paramGroup);
        }
    }

    class HttpZBaseParser {
        rawMessage;
        startRow;
        headerRows;
        bodyRows;
        headers;
        headersSize;
        body;
        bodySize;
        constructor(rawMessage) {
            this.rawMessage = rawMessage;
        }
        _parseMessageForRows() {
            const [headers, body] = splitBy(this.rawMessage, EOL2X);
            if (isNil(headers) || isNil(body)) {
                throw HttpZError.get('Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]');
            }
            this._calcSizes(headers, body);
            const headerRows = headers.split(EOL);
            this.startRow = head(headerRows);
            this.headerRows = tail(headerRows);
            this.bodyRows = body;
        }
        _parseHeaderRows() {
            this.headers = this.headerRows.map(hRow => {
                let [name, value] = splitBy(hRow, ':');
                if (!name) {
                    throw HttpZError.get('Incorrect header row format, expected: Name: Value', hRow);
                }
                if (isNil(value)) {
                    value = '';
                }
                else if (regexps.quotedHeaderValue.test(value)) {
                    value = trim(value, '"');
                }
                return {
                    name: prettifyHeaderName(name),
                    value,
                };
            });
        }
        _parseBodyRows() {
            if (!this.bodyRows) {
                return;
            }
            this._processTransferEncodingChunked();
            this.body = {};
            const contentTypeHeader = this._getContentTypeValue();
            if (contentTypeHeader) {
                this.body.contentType = contentTypeHeader.toLowerCase().split(';')[0];
            }
            switch (this.body.contentType) {
                case HttpContentTypeMultipart.formData:
                case HttpContentTypeMultipart.alternative:
                case HttpContentTypeMultipart.mixed:
                case HttpContentTypeMultipart.related:
                    this._parseFormDataBody();
                    break;
                case HttpContentTypeApplication.xWwwFormUrlencoded:
                    this._parseUrlencodedBody();
                    break;
                default:
                    this._parseTextBody();
                    break;
            }
        }
        _processTransferEncodingChunked() {
            const isChunked = this.headers.find(h => h.name === HttpHeader.transferEncoding.toString() && h.value.includes('chunked'));
            if (!isChunked) {
                return;
            }
            let text = this.bodyRows;
            const buffer = [];
            do {
                const rows = text.match(regexps.chunkRow);
                const firstRow = rows ? rows[0] : '';
                const chunkLength = +('0x' + firstRow || '').trim();
                if (!chunkLength) {
                    throw HttpZError.get('Incorrect row, expected: NumberEOL', this.bodyRows);
                }
                text = text.slice(firstRow.length);
                const chunk = text.slice(0, chunkLength);
                buffer.push(chunk);
                text = text.slice(chunkLength + EOL.length);
            } while (text);
            this.bodyRows = buffer.join('');
        }
        _parseFormDataBody() {
            this.body.boundary = this._getBoundary();
            this.body.params = this.bodyRows
                .split(`--${this.body.boundary}`)
                .filter((unused, index, params) => index > 0 && index < params.length - 1)
                .map(paramGroup => FormDataParamParser.parse(paramGroup));
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
            this.headersSize = (headers + EOL2X).length;
            this.bodySize = body.length;
        }
        _getContentTypeValue() {
            const contentTypeHeader = this.headers.find(h => h.name === HttpHeader.contentType.toString());
            if (!contentTypeHeader) {
                return;
            }
            if (!contentTypeHeader.value) {
                return;
            }
            return contentTypeHeader.value;
        }
        _getBoundary() {
            const contentTypeValue = this._getContentTypeValue();
            if (!contentTypeValue) {
                throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary');
            }
            const params = contentTypeValue.split(';')[1];
            if (!params) {
                throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary');
            }
            const boundary = params.match(regexps.boundary);
            if (!boundary) {
                throw HttpZError.get('Incorrect boundary, expected: boundary=value', params);
            }
            return trim(boundary[0], '"');
        }
    }

    const SUPER_RANDOM_HOST = 'superrandomhost28476561927456.com';
    class HttpZRequestParser extends HttpZBaseParser {
        opts;
        static parse(...params) {
            const instance = new HttpZRequestParser(...params);
            return instance.parse();
        }
        method;
        target;
        host;
        path;
        protocolVersion;
        hostRow;
        cookiesRow;
        queryParams;
        cookies;
        constructor(rawMessage, opts) {
            super(rawMessage);
            this.opts = opts;
        }
        parse() {
            this._parseMessageForRows();
            this._parseHostRow();
            this._parseStartRow();
            this._parseHeaderRows();
            this._parseCookieRows();
            this._parseBodyRows();
            return this._generateModel();
        }
        _parseMessageForRows() {
            super._parseMessageForRows();
            this.hostRow = this.headerRows.find(row => row.toLowerCase().startsWith('host:'));
            this.cookiesRow = this.headerRows.find(row => row.toLowerCase().startsWith('cookie:'));
        }
        _parseHostRow() {
            if (this.opts.mandatoryHost) {
                assertNotEmptyString(this.hostRow, 'host header');
            }
            const [unused, value] = splitBy(this.hostRow || '', ':');
            if (this.opts.mandatoryHost) {
                assertNotEmptyString(value, 'host header value');
            }
            this.host = value;
        }
        _parseStartRow() {
            if (!regexps.requestStartRow.test(this.startRow)) {
                throw HttpZError.get('Incorrect startRow format, expected: Method request-target HTTP-Version', this.startRow);
            }
            const rowParts = this.startRow.split(' ');
            this.method = rowParts[0].toUpperCase();
            this.protocolVersion = rowParts[2].toUpperCase();
            this.target = rowParts[1];
            let parsedUrl;
            try {
                parsedUrl = parseUrl(this.target, SUPER_RANDOM_HOST);
            }
            catch (err) {
                if (err.code === 'ERR_INVALID_URL') {
                    throw HttpZError.get('Invalid target', this.target);
                }
                throw err;
            }
            if (!this.host) {
                this.host = parsedUrl.host !== SUPER_RANDOM_HOST ? parsedUrl.host : 'unspecified-host';
            }
            this.path = parsedUrl.path;
            this.queryParams = parsedUrl.params;
        }
        _parseCookieRows() {
            if (!this.cookiesRow) {
                return;
            }
            const [cookieHeaderName, values] = splitBy(this.cookiesRow, ':');
            if (!cookieHeaderName) {
                throw HttpZError.get('Incorrect cookie row format, expected: Cookie: Name1=Value1;...', this.cookiesRow);
            }
            if (!values) {
                this.cookies = [];
                return;
            }
            this.cookies = values.split(';').map(pair => {
                const [name, value] = splitBy(pair, '=');
                const cookie = {
                    name,
                };
                if (value) {
                    cookie.value = value;
                }
                if (!cookie.name) {
                    throw HttpZError.get('Incorrect cookie pair format, expected: Name1=Value1;...', values);
                }
                return cookie;
            });
        }
        _generateModel() {
            const model = {
                method: this.method,
                protocolVersion: this.protocolVersion,
                target: this.target,
                host: this.host,
                path: this.path,
                headers: this.headers,
                headersSize: this.headersSize,
                bodySize: this.bodySize,
            };
            if (this.queryParams) {
                model.queryParams = this.queryParams;
            }
            if (this.cookies) {
                model.cookies = this.cookies;
            }
            if (this.body) {
                model.body = this.body;
            }
            return model;
        }
    }

    class HttpZResponseParser extends HttpZBaseParser {
        static parse(...params) {
            const instance = new HttpZResponseParser(...params);
            return instance.parse();
        }
        protocolVersion;
        statusCode;
        statusMessage;
        cookieRows;
        cookies;
        parse() {
            this._parseMessageForRows();
            this._parseStartRow();
            this._parseHeaderRows();
            this._parseCookieRows();
            this._parseBodyRows();
            return this._generateModel();
        }
        _parseMessageForRows() {
            super._parseMessageForRows();
            this.cookieRows = this.headerRows.filter(row => row.toLowerCase().startsWith('set-cookie'));
        }
        _parseStartRow() {
            if (!regexps.responseStartRow.test(this.startRow)) {
                throw HttpZError.get('Incorrect startRow format, expected: HTTP-Version status-code reason-phrase', this.startRow);
            }
            const rowParts = this.startRow.split(' ');
            this.protocolVersion = rowParts[0].toUpperCase();
            this.statusCode = +rowParts[1];
            this.statusMessage = rowParts.splice(2).join(' ');
        }
        _parseCookieRows() {
            if (isEmpty(this.cookieRows)) {
                return;
            }
            this.cookies = this.cookieRows.map(cookiesRow => {
                const [unused, values] = splitBy(cookiesRow, ':');
                if (!values) {
                    return {};
                }
                const params = values.split(';');
                const paramWithName = head(params);
                const otherParams = tail(params);
                let [name, value] = paramWithName.split('=');
                name = name.trim();
                value = value.trim();
                if (!name) {
                    throw HttpZError.get('Incorrect set-cookie pair format, expected: Name1=Value1;...', values);
                }
                const cookie = {
                    name,
                };
                if (value) {
                    cookie.value = value;
                }
                if (otherParams.length > 0) {
                    cookie.params = otherParams.map(param => param.trim());
                }
                return cookie;
            });
        }
        _generateModel() {
            const model = {
                protocolVersion: this.protocolVersion,
                statusCode: this.statusCode,
                statusMessage: this.statusMessage,
                headers: this.headers,
                headersSize: this.headersSize,
                bodySize: this.bodySize,
            };
            if (this.cookies) {
                model.cookies = this.cookies;
            }
            if (this.body) {
                model.body = this.body;
            }
            return model;
        }
    }

    function parse(rawMessage, opts = {}) {
        if (isNil(rawMessage)) {
            throw HttpZError.get('rawMessage is required');
        }
        if (!isString(rawMessage)) {
            throw HttpZError.get('rawMessage must be a string');
        }
        const firstRow = head(rawMessage.split(EOL));
        if (regexps.requestStartRow.test(firstRow)) {
            return HttpZRequestParser.parse(rawMessage, opts);
        }
        if (regexps.responseStartRow.test(firstRow)) {
            return HttpZResponseParser.parse(rawMessage);
        }
        throw HttpZError.get('rawMessage has incorrect format');
    }

    const getLibVersion = () => {
        return '8.1.1';
    };

    exports.HttpZError = HttpZError;
    exports.build = build;
    exports.consts = constants;
    exports.getLibVersion = getLibVersion;
    exports.parse = parse;
    exports.utils = utils;

}));
