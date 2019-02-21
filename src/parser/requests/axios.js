'use strict';

const _       = require('lodash');
const utils   = require('../../utils');
const Default = require('./default');

class HttpZAxiosRequestParser extends Default {
  static parse(params) {
    let instance = new HttpZAxiosRequestParser(params);
    return instance.parse();
  }

  // TODO: test it
  _generateObj() {
    return {
      method: this.method,
      url: utils.genUrl(_.pick(this, 'protocol', 'host', 'path', 'basicAuth', 'params')),
      headers: this._getHeaders(),
      data: this._getBody(),
      responseType: 'text',
      validateStatus: () => true
    };
  }

  // TODO: test it
  _getHeaders() {
    let headers = _.reduce(this.headers, (result, header) => {
      result[header.name] = _.chain(header.values)
        .map(headerVal => {
          let val = headerVal.value;
          if (headerVal.params) {
            return val += ';' + headerVal.params;
          }
          return val;
        })
        .join(', ')
        .value();
      return result;
    }, {});

    if (this.cookie) {
      headers.Cookie = _.chain(this.cookie)
        .map(cookie => cookie.name + '=' + cookie.value)
        .join('; ')
        .value();
    }

    return headers;
  }

  // TODO: implement it
  // TODO: test it
  _getBody() {
    return this.body;
  }
}

module.exports = HttpZAxiosRequestParser;
