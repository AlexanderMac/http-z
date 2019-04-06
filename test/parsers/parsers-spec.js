'use strict';

const sinon          = require('sinon');
const should         = require('should');
const nassert        = require('n-assert');
const parser         = require('../../src/parsers');
const RequestParser  = require('../../src/parsers/request');
const ResponseParser = require('../../src/parsers/response');

describe('parsers / index', () => {
  beforeEach(() => {
    sinon.stub(RequestParser, 'parse');
    sinon.stub(ResponseParser, 'parse');
  });

  afterEach(() => {
    RequestParser.parse.restore();
    ResponseParser.parse.restore();
  });

  it('should throw error when params is empty', () => {
    should(parser.bind(null)).throw(Error, {
      message: 'httpMessage is required'
    });
  });

  it('should throw error when httpMessage is nil', () => {
    let params = {};

    should(parser.bind(null, params)).throw(Error, {
      message: 'httpMessage is required'
    });
  });

  it('should throw error when httpMessage has unknown format', () => {
    let params = {
      httpMessage: 'invalid'
    };

    should(parser.bind(null, params)).throw(Error, {
      message: 'Unknown httpMessage format'
    });
  });

  it('should call RequestParser.parse when httpMessage is request', () => {
    let params = {
      httpMessage: 'get /features http/1.1'
    };
    let expected = 'parsed-request';
    let expectedArgs = {
      httpMessage: params.httpMessage,
      eol: '\n'
    };

    RequestParser.parse.returns('parsed-request');

    let actual = parser(params);
    should(actual).eql(expected);

    nassert.assertFn({ inst: RequestParser, fnName: 'parse', expectedArgs });
  });

  it('should call ResponseParser.parse when httpMessage is response', () => {
    let params = {
      httpMessage: 'http/1.1 200 Ok',
      eol: '\r\n'
    };
    let expected = 'parsed-response';
    let expectedArgs = {
      httpMessage: params.httpMessage,
      eol: '\r\n'
    };

    ResponseParser.parse.returns('parsed-response');

    let actual = parser(params);
    should(actual).eql(expected);

    nassert.assertFn({ inst: ResponseParser, fnName: 'parse', expectedArgs });
  });
});
