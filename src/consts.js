// TODO: rename to upper case
const eol = '\r\n';
const eol2x = eol + eol;
const basicLatin = '[\\u0009\\u0020-\\u007E]';
const paramName = '[A-Za-z0-9_.\\[\\]-]'; // TODO: extend
const methods = '(CONNECT|OPTIONS|TRACE|GET|HEAD|POST|PUT|PATCH|DELETE)';
const protocolVer = '(HTTP)\\/(1\\.0|1\\.1|2\\.0)';

const regexps = {};
regexps.quote = /"/g;
regexps.startNl = new RegExp(`^${eol}`);
regexps.endNl = new RegExp(`${eol}$`);
regexps.requestStartRow = new RegExp(`^${methods} \\S* ${protocolVer}$`);
regexps.responseStartRow = new RegExp(`^${protocolVer} \\d{3} ${basicLatin}*$`);
// TODO: maybe incorrect, because basicLatin contains quote
regexps.quoutedHeaderValue = new RegExp(`^"${basicLatin}+"$`);
regexps.boundary = /(?<=boundary=)"{0,1}[A-Za-z0-9'()+_,.:=?-]+"{0,1}/;
regexps.contentDisposition = new RegExp(`^Content-Disposition: *(form-data|inline|attachment)${basicLatin}*${eol}`, 'i');
regexps.contentType = new RegExp(`^Content-Type:[\\S ]*${eol}`, 'i');
regexps.contentDispositionType = /(?<=Content-Disposition:) *(form-data|inline|attachment)/;
regexps.dispositionName = new RegExp(`(?<=name=)"${paramName}+"`, 'i');
regexps.dispositionFileName = new RegExp(`(?<=filename=)"${paramName}+"`, 'i');

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
  pathch: 'PATCH',
  delete: 'DELETE'
};

http.postMethods = [
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
  contentLength: 'Content-Length',
  userAgent: 'User-Agent',
  setCookie: 'Set-Cookie'
};

module.exports = {
  eol,
  eol2x,
  regexps,
  http
};
