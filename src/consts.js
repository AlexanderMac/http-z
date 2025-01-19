const EOL = '\r\n'
const EOL2X = EOL + EOL
const BASIC_LATIN = '[\\u0009\\u0020-\\u007E]'
const PARAM_NAME = '[A-Za-z0-9_.\\[\\]-]' // TODO: extend
const HTTP_METHODS = '(CONNECT|OPTIONS|TRACE|GET|HEAD|POST|PUT|PATCH|DELETE)'
const HTTP_PROTOCOL_VERSIONS = '(HTTP)\\/(1\\.0|1\\.1|2(\\.0){0,1})'

const regexps = {}
regexps.quote = /"/g
regexps.startNl = new RegExp(`^${EOL}`)
regexps.endNl = new RegExp(`${EOL}$`)
regexps.requestStartRow = new RegExp(`^${HTTP_METHODS} \\S* ${HTTP_PROTOCOL_VERSIONS}$`)
regexps.responseStartRow = new RegExp(`^${HTTP_PROTOCOL_VERSIONS} \\d{3} ${BASIC_LATIN}*$`)
// eslint-disable-next-line no-control-regex
regexps.quoutedHeaderValue = new RegExp('^"[\\u0009\\u0020\\u0021\\u0023-\\u007E]+"$')
regexps.boundary = /(?<=boundary=)"{0,1}[A-Za-z0-9'()+_,.:=?-]+"{0,1}/
regexps.contentDisposition = new RegExp(
  `^Content-Disposition: *(form-data|inline|attachment)${BASIC_LATIN}*${EOL}`,
  'i'
)
regexps.contentType = new RegExp(`^Content-Type:[\\S ]*${EOL}`, 'i')
regexps.contentDispositionType = /(?<=Content-Disposition:) *(form-data|inline|attachment)/
regexps.dispositionName = new RegExp(`(?<=name=)"${PARAM_NAME}+"`, 'i')
regexps.dispositionFileName = new RegExp(`(?<=filename=)"${PARAM_NAME}+"`, 'i')
regexps.chunkRow = new RegExp(`^[0-9a-fA-F]+${EOL}`)

const http = {}

http.protocols = {
  http: 'HTTP',
  https: 'HTTPS'
}

http.protocolVersions = {
  http10: 'HTTP/1.0',
  http11: 'HTTP/1.1',
  http20: 'HTTP/2.0'
}

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
}

http.postMethods = [http.methods.post, http.methods.put, http.methods.patch]

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
}

http.headers = {
  host: 'Host',
  contentType: 'Content-Type',
  contentLength: 'Content-Length',
  userAgent: 'User-Agent',
  setCookie: 'Set-Cookie',
  transferEncoding: 'Transfer-Encoding'
}

module.exports = {
  EOL,
  EOL2X,
  regexps,
  http
}
