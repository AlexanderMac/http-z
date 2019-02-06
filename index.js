'use strict';

exports.parseRequest = require('./src/parser/request').parse;
exports.parseResponse = require('./src/parser/response').parse;
exports.build = require('./src/builder').build;
