declare const EOL = "\r\n";
declare const EOL2X: string;
declare const regexps: {
    quote: RegExp;
    startNl: RegExp;
    endNl: RegExp;
    requestStartRow: RegExp;
    responseStartRow: RegExp;
    quotedHeaderValue: RegExp;
    boundary: RegExp;
    contentDisposition: RegExp;
    contentType: RegExp;
    contentDispositionType: RegExp;
    dispositionName: RegExp;
    dispositionFileName: RegExp;
    chunkRow: RegExp;
};
declare enum HttpProtocol {
    http = "HTTP",
    https = "HTTPS"
}
declare enum HttpProtocolVersion {
    http10 = "HTTP/1.0",
    http11 = "HTTP/1.1",
    http20 = "HTTP/2.0"
}
declare enum HttpMethod {
    connect = "CONNECT",
    options = "OPTIONS",
    trace = "TRACE",
    head = "HEAD",
    get = "GET",
    post = "POST",
    put = "PUT",
    patch = "PATCH",
    delete = "DELETE"
}
declare const HttpPostMethods: HttpMethod[];
declare enum HttpHeader {
    host = "Host",
    contentType = "Content-Type",
    contentLength = "Content-Length",
    userAgent = "User-Agent",
    setCookie = "Set-Cookie",
    transferEncoding = "Transfer-Encoding"
}
declare enum HttpContentTextType {
    any = "text/",
    css = "text/css",
    csv = "text/csv",
    html = "text/html",
    javascript = "text/javascript",
    plain = "text/plain",
    xml = "text/xml"
}
declare enum HttpContentApplicationType {
    any = "application/",
    javascript = "application/javascript",
    json = "application/json",
    octetStream = "application/octet-stream",
    ogg = "application/ogg",
    pdf = "application/pdf",
    xhtml = "application/xhtml+xml",
    xml = "application/xml",
    xShockwaveFlash = "application/x-shockwave-flash",
    xWwwFormUrlencoded = "application/x-www-form-urlencoded",
    zip = "application/zip"
}
declare enum HttpContentMultipartType {
    any = "multipart/",
    alternative = "multipart/alternative",
    formData = "multipart/form-data",
    mixed = "multipart/mixed",
    related = "multipart/related"
}
declare enum HttpContentImageType {
    any = "image/",
    gif = "image/gif",
    jpeg = "image/jpeg",
    png = "image/png",
    tiff = "image/tiff",
    icon = "image/x-icon"
}
declare enum HttpContentAudioType {
    any = "audio/"
}
declare enum HttpContentVideoType {
    any = "video/"
}
declare enum HttpContentFonType {
    any = "font/"
}

declare const constants_EOL: typeof EOL;
declare const constants_EOL2X: typeof EOL2X;
type constants_HttpContentApplicationType = HttpContentApplicationType;
declare const constants_HttpContentApplicationType: typeof HttpContentApplicationType;
type constants_HttpContentAudioType = HttpContentAudioType;
declare const constants_HttpContentAudioType: typeof HttpContentAudioType;
type constants_HttpContentFonType = HttpContentFonType;
declare const constants_HttpContentFonType: typeof HttpContentFonType;
type constants_HttpContentImageType = HttpContentImageType;
declare const constants_HttpContentImageType: typeof HttpContentImageType;
type constants_HttpContentMultipartType = HttpContentMultipartType;
declare const constants_HttpContentMultipartType: typeof HttpContentMultipartType;
type constants_HttpContentTextType = HttpContentTextType;
declare const constants_HttpContentTextType: typeof HttpContentTextType;
type constants_HttpContentVideoType = HttpContentVideoType;
declare const constants_HttpContentVideoType: typeof HttpContentVideoType;
type constants_HttpHeader = HttpHeader;
declare const constants_HttpHeader: typeof HttpHeader;
type constants_HttpMethod = HttpMethod;
declare const constants_HttpMethod: typeof HttpMethod;
declare const constants_HttpPostMethods: typeof HttpPostMethods;
type constants_HttpProtocol = HttpProtocol;
declare const constants_HttpProtocol: typeof HttpProtocol;
type constants_HttpProtocolVersion = HttpProtocolVersion;
declare const constants_HttpProtocolVersion: typeof HttpProtocolVersion;
declare const constants_regexps: typeof regexps;
declare namespace constants {
  export { constants_EOL as EOL, constants_EOL2X as EOL2X, constants_HttpContentApplicationType as HttpContentApplicationType, constants_HttpContentAudioType as HttpContentAudioType, constants_HttpContentFonType as HttpContentFonType, constants_HttpContentImageType as HttpContentImageType, constants_HttpContentMultipartType as HttpContentMultipartType, constants_HttpContentTextType as HttpContentTextType, constants_HttpContentVideoType as HttpContentVideoType, constants_HttpHeader as HttpHeader, constants_HttpMethod as HttpMethod, constants_HttpPostMethods as HttpPostMethods, constants_HttpProtocol as HttpProtocol, constants_HttpProtocolVersion as HttpProtocolVersion, constants_regexps as regexps };
}

type HttpZHeader = {
    name: string;
    value: string;
};
type HttpZParam = {
    name: string;
    value?: string;
};
type HttpZBody = {
    text?: string;
    params?: HttpZBodyParam[];
    contentType?: string;
    boundary?: string;
};
type HttpZBodyParam = {
    name?: string;
    value?: string;
    type?: string;
    fileName?: string;
    contentType?: string;
};

type HttpZBuilderOptions = {
    mandatoryHost?: boolean;
};
type HttpZBuilderModel = {
    headers: HttpZHeader[];
    body?: HttpZBody;
};

declare function build(messageModel: HttpZBuilderModel, opts?: HttpZBuilderOptions): string | never;

declare class HttpZError extends Error {
    static get(...params: ConstructorParameters<typeof HttpZError>): HttpZError;
    details: string | undefined;
    constructor(message: string, details?: string);
}

type HttpZParserOptions = {
    mandatoryHost?: boolean;
};
type HttpZParserModel = {
    headers: HttpZHeader[];
    body?: HttpZBody;
    headersSize?: number;
    bodySize?: number;
};

declare function parse(rawMessage: string, opts?: HttpZParserOptions): HttpZParserModel | never;

type ParsedUrl = {
    protocol: string;
    host: string;
    path: string;
    params: HttpZParam[];
};
declare const getLibVersion: () => string;
declare const splitBy: (str: string, delimiter: string) => string[];
declare const isAbsoluteUrl: (url: string) => boolean;
declare const parseUrl: (url: string, host: string) => ParsedUrl;
declare const arrayToPairs: (params: HttpZParam[]) => string[][];
declare const prettifyHeaderName: (name: string | null | undefined) => string;
declare const getEmptyStringForUndefined: (value: string | null | undefined) => string;
declare const extendIfNotUndefined: (obj: object, fieldName: string, fieldValue: string | undefined) => void;
declare const isUndefined: (value: unknown) => boolean;
declare const isNil: (value: unknown) => boolean;
declare const isEmpty: (value: unknown) => boolean;
declare const isString: (value: unknown) => boolean;
declare const isNumber: (value: unknown) => boolean;
declare const isArray: (value: unknown) => boolean;
declare const isError: (value: unknown) => boolean;
declare const isPlainObject: (value: unknown) => boolean;
declare const capitalize: (value: string) => string;
declare const head: <T>(value: T[]) => T;
declare const tail: <T>(value: T[]) => T[];
declare const trim: (value: string, chars?: string | undefined) => string;
declare const trimEnd: (value: string, chars?: string | undefined) => string;

type utils_ParsedUrl = ParsedUrl;
declare const utils_arrayToPairs: typeof arrayToPairs;
declare const utils_capitalize: typeof capitalize;
declare const utils_extendIfNotUndefined: typeof extendIfNotUndefined;
declare const utils_getEmptyStringForUndefined: typeof getEmptyStringForUndefined;
declare const utils_getLibVersion: typeof getLibVersion;
declare const utils_head: typeof head;
declare const utils_isAbsoluteUrl: typeof isAbsoluteUrl;
declare const utils_isArray: typeof isArray;
declare const utils_isEmpty: typeof isEmpty;
declare const utils_isError: typeof isError;
declare const utils_isNil: typeof isNil;
declare const utils_isNumber: typeof isNumber;
declare const utils_isPlainObject: typeof isPlainObject;
declare const utils_isString: typeof isString;
declare const utils_isUndefined: typeof isUndefined;
declare const utils_parseUrl: typeof parseUrl;
declare const utils_prettifyHeaderName: typeof prettifyHeaderName;
declare const utils_splitBy: typeof splitBy;
declare const utils_tail: typeof tail;
declare const utils_trim: typeof trim;
declare const utils_trimEnd: typeof trimEnd;
declare namespace utils {
  export { type utils_ParsedUrl as ParsedUrl, utils_arrayToPairs as arrayToPairs, utils_capitalize as capitalize, utils_extendIfNotUndefined as extendIfNotUndefined, utils_getEmptyStringForUndefined as getEmptyStringForUndefined, utils_getLibVersion as getLibVersion, utils_head as head, utils_isAbsoluteUrl as isAbsoluteUrl, utils_isArray as isArray, utils_isEmpty as isEmpty, utils_isError as isError, utils_isNil as isNil, utils_isNumber as isNumber, utils_isPlainObject as isPlainObject, utils_isString as isString, utils_isUndefined as isUndefined, utils_parseUrl as parseUrl, utils_prettifyHeaderName as prettifyHeaderName, utils_splitBy as splitBy, utils_tail as tail, utils_trim as trim, utils_trimEnd as trimEnd };
}

export { HttpZError, build, constants as consts, parse, utils };
