const sinon = require('sinon');
const should = require('should');
const nassert = require('n-assert');
const HttpZConsts = require('../../src/consts');
const HttpZError = require('../../src/error');
const parser = require('../../src/parsers');
const RequestParser = require('../../src/parsers/request');
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

  it('should throw error when function called without params', () => {
    should(parser.bind(null)).throw(HttpZError, {
      message: 'plainMessage is required'
    });
  });

  it('should throw error when plainMessage is nil', () => {
    let params = [null];

    should(parser.bind(null, ...params)).throw(HttpZError, {
      message: 'plainMessage is required'
    });
  });

  it('should throw error when plainMessage has unknown format', () => {
    let params = ['invalid'];

    should(parser.bind(null, ...params)).throw(HttpZError, {
      message: 'Unknown plainMessage format'
    });
  });

  function _testCallRequestParser() {
    let plainMessage = [
      'GET /features HTTP/1.1',
      'host: example.com',
      ''
    ].join(HttpZConsts.eol);
    let expected = 'parsed-request';
    let expectedArgs = plainMessage;

    RequestParser.parse.returns('parsed-request');

    let actual = parser(plainMessage);
    should(actual).eql(expected);

    nassert.assertFn({ inst: RequestParser, fnName: 'parse', expectedArgs });
    nassert.assertFn({ inst: ResponseParser, fnName: 'parse' });
  }

  it('should call RequestParser.parse when plainMessage is request', () => {
    _testCallRequestParser();
  });

  function _testCallResponseParser() {
    let plainMessage = [
      'HTTP/1.1 200 Ok',
      'host: example.com',
      ''
    ].join(HttpZConsts.eol);
    let expected = 'parsed-response';
    let expectedArgs = plainMessage;

    ResponseParser.parse.returns('parsed-response');

    let actual = parser(plainMessage);
    should(actual).eql(expected);

    nassert.assertFn({ inst: RequestParser, fnName: 'parse' });
    nassert.assertFn({ inst: ResponseParser, fnName: 'parse', expectedArgs });
  }

  it('should call ResponseParser.parse when plainMessage is response', () => {
    _testCallResponseParser();
  });
});
