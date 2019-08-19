'use strict';

const RegExpStrings = {
  method: '(get|post|put|patch|delete)',
  protocol: '(https?|ftp)',
  protocolVer: '(http)\\/(1\\.0|1\\.1|2\\.0)',
  url: '((https?|ftp)://)*(-\\.)?([^\\s/?\\.#-]+\\.?)+(/[^\\s]*)?',
  path: '\\/\\S*'
};

const regexps = {
  httpMethod: new RegExp(RegExpStrings.method, 'i'),
  httpProtocol: new RegExp(RegExpStrings.protocol, 'i'),
  httpProtocolVer: new RegExp(RegExpStrings.protocolVer, 'i'),
  url: new RegExp(RegExpStrings.url, 'i'),
  requestStartRow: new RegExp('^' + RegExpStrings.method + ' ' + RegExpStrings.path + ' ' + RegExpStrings.protocolVer + '$', 'i'),
  responseStartRow: new RegExp('^' + RegExpStrings.protocolVer + ' ' + '\\d{3}' + ' ' + '\\w+( \\w+)*$'  + '$', 'i'),
  boundary: /boundary=\w+/im,
  param: /Content-Disposition:\s+form-data;\s+name="\w+"\n\n/im, // TODO: use eol from paran
  paramName: /name="\w+"/im,
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
