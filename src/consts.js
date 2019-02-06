'use strict';

const RegExpStrings = {
  method: '(get|post|put|patch|delete)',
  protocol: '(https?|ftp)',
  protocolWithTwoSlash: '(https?|ftp)://',
  protocolVer: '(http)\\/(1\\.0|1\\.1|2\\.0)',
  url: '((https?|ftp)://)*(-\\.)?([^\\s/?\\.#-]+\\.?)+(/[^\\s]*)?'
};

const regexps = {
  httpMethod: new RegExp(RegExpStrings.method, 'i'),
  httpProtocol: new RegExp(RegExpStrings.protocol, 'i'),
  httpProtocolWithTwoSlash: new RegExp(RegExpStrings.protocolWithTwoSlash, 'i'),
  httpProtocolVer: new RegExp(RegExpStrings.protocolVer, 'i'),
  url: new RegExp(RegExpStrings.url, 'i'),
  requestStartRow: new RegExp('^' + RegExpStrings.method + ' ' + RegExpStrings.url + ' ' + RegExpStrings.protocolVer + '$', 'i'),
  responseStartRow: new RegExp('^' + RegExpStrings.protocolVer + ' ' + '\\d{3}' + ' ' + '\\w+( \\w+)*$'  + '$', 'i'),
  boundary: /boundary=-+\w+/im,
  param: /Content-Disposition:\s*form-data;\s*name="\w+"/im,
  paramName: /name="\w+"/im,
  quote: /"/g
};

const http = {
  contentTypes: {
    plain: 'text/plain',
    json: 'application/json',
    formData: 'multipart/form-data',
    xWwwFormUrlencoded: 'application/x-www-form-urlencoded'
  },
  headers: {
    contentType: 'Content-Type',
    contentLength: 'Content-Length'
  }
};

module.exports = {
  regexps,
  http
};
