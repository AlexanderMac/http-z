'use strict';

const Default = require('./default');

class HttpZAxiosResponseParser extends Default {
  static parse(params) {
    let instance = new HttpZAxiosResponseParser(params);
    return instance.parse();
  }

  parse() {}
}

module.exports = HttpZAxiosResponseParser;
