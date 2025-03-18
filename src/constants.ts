export const EOL = '\r\n'
export const EOL2X = EOL + EOL

const BASIC_LATIN = '[\\u0009\\u0020-\\u007E]'
const HTTP_METHODS = '(CONNECT|OPTIONS|TRACE|GET|HEAD|POST|PUT|PATCH|DELETE)'
const HTTP_PROTOCOL_VERSIONS = '(HTTP)\\/(1\\.0|1\\.1|2(\\.0){0,1})'

export const regexps = {
  quote: /"/g,
  nlStart: new RegExp(`^${EOL}`),
  nlEnd: new RegExp(`${EOL}$`),
  requestStartRow: new RegExp(`^${HTTP_METHODS}\\s\\S*\\s${HTTP_PROTOCOL_VERSIONS}$`),
  responseStartRow: new RegExp(`^${HTTP_PROTOCOL_VERSIONS}\\s\\d{3}\\s${BASIC_LATIN}*$`),
  // eslint-disable-next-line no-control-regex
  quotedHeaderValue: new RegExp('^"[\\u0009\\u0020\\u0021\\u0023-\\u007E]+"$'),
  boundary: new RegExp(`(?<=boundary=)"{0,1}[A-Za-z0-9'()+_,.:=?-]+"{0,1}`),
  contentDisposition: new RegExp(
    `^Content-Disposition:\\s*(form-data|inline|attachment)(?:\\s*;\\s*(name|filename)\\s*=\\s*(?:"([^"]+)"|([^;\\s]+)))*${EOL}`,
    'i',
  ),
  contentType: new RegExp(`^Content-Type:[\\S ]*${EOL}`, 'i'),
  contentDispositionType: new RegExp(`(?<=Content-Disposition:)\\s*(form-data|inline|attachment)`),
  dispositionName: new RegExp(`(?<=name=)(?:"([^"]+)"|([^;\\s]+))+`, 'i'),
  dispositionFileName: new RegExp(`(?<=filename=)(?:"([^"]+)"|([^;\\s]+))+`, 'i'),
  chunkRow: new RegExp(`^[0-9a-fA-F]+${EOL}`),
}

export enum HttpProtocol {
  http = 'HTTP',
  https = 'HTTPS',
}

export enum HttpProtocolVersion {
  http10 = 'HTTP/1.0',
  http11 = 'HTTP/1.1',
  http20 = 'HTTP/2.0',
}

export enum HttpMethod {
  connect = 'CONNECT',
  options = 'OPTIONS',
  trace = 'TRACE',
  head = 'HEAD',
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  patch = 'PATCH',
  delete = 'DELETE',
}

export const HttpPostMethods = [HttpMethod.post, HttpMethod.put, HttpMethod.patch]

export enum HttpHeader {
  host = 'Host',
  contentType = 'Content-Type',
  contentLength = 'Content-Length',
  userAgent = 'User-Agent',
  setCookie = 'Set-Cookie',
  transferEncoding = 'Transfer-Encoding',
}

export enum HttpContentTypeText {
  any = 'text/',
  css = 'text/css',
  csv = 'text/csv',
  html = 'text/html',
  javascript = 'text/javascript',
  plain = 'text/plain',
  xml = 'text/xml',
}

export enum HttpContentTypeApplication {
  any = 'application/',
  javascript = 'application/javascript',
  json = 'application/json',
  octetStream = 'application/octet-stream',
  ogg = 'application/ogg',
  pdf = 'application/pdf',
  xhtml = 'application/xhtml+xml',
  xml = 'application/xml',
  xShockwaveFlash = 'application/x-shockwave-flash',
  xWwwFormUrlencoded = 'application/x-www-form-urlencoded',
  zip = 'application/zip',
}

export enum HttpContentTypeMultipart {
  any = 'multipart/',
  alternative = 'multipart/alternative',
  formData = 'multipart/form-data',
  mixed = 'multipart/mixed',
  related = 'multipart/related',
}

export enum HttpContentTypeImage {
  any = 'image/',
  gif = 'image/gif',
  jpeg = 'image/jpeg',
  png = 'image/png',
  tiff = 'image/tiff',
  icon = 'image/x-icon',
}

export enum HttpContentTypeAudio {
  any = 'audio/',
}

export enum HttpContentTypeVideo {
  any = 'video/',
}

export enum HttpContentTypeFont {
  any = 'font/',
}
