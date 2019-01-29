'use strict';

const regexps = {
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
