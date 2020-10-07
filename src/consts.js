const RegExpStrings = {
  method: '(TRACE|CONNECT|OPTIONS|HEAD|GET|POST|PUT|PATCH|DELETE)',
  protocolVer: '(HTTP)\\/(1\\.0|1\\.1|2\\.0)',
  url: '((https?|ftp)://)*(-\\.)?([^\\s/?\\.#-]+\\.?)+(/[^\\s]*)?',
  path: '\\/\\S*'
};

const regexps = {
  requestStartRow: new RegExp(`^${RegExpStrings.method} ${RegExpStrings.path} ${RegExpStrings.protocolVer}$`),
  responseStartRow: new RegExp(`^${RegExpStrings.protocolVer} \\d{3} [\\u0009\\u0020-\\u007E\\u0080-\\u00FF]*$`),
  boundary: /boundary=\S+/i,
  param: /Content-Disposition:\s+form-data;\s+name="\S+"\n\n/im, // TODO: use real eol
  paramName: /name="\S+"/im,
  quote: /"/g
};

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
  head: 'HEAD',
  connect: 'CONNECT',
  options: 'OPTIONS',
  trace: 'TRACE',
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  pathch: 'PATCH',
  delete: 'DELETE'
};

http.methodsWithBody = [
  http.methods.post,
  http.methods.put,
  http.methods.pathch
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
  contentLength: 'Content-Length'
};

module.exports = {
  regexps,
  http
};
