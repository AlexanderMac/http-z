'use strict';

module.exports = {
  parseRequest: require('./src/parser/request').parse,
  parseResponse: require('./src/parser/response').parse,
  buildRequest: require('./src/builder/request').build,
  buildResponse: require('./src/builder/response').build
};
