'use strict';

const _             = require('lodash');
const sinon         = require('sinon');
const should        = require('should');
const nassert       = require('n-assert');
const HttpZError    = require('../../src/error');
const RequestParser = require('../../src/parsers/request');

describe('parsers / request', () => {
  function getParserInstance(params) {
    return new RequestParser(params);
  }

  describe('static parse', () => {
    beforeEach(() => {
      sinon.stub(RequestParser.prototype, 'parse');
    });

    afterEach(() => {
      RequestParser.prototype.parse.restore();
    });

    it('should create an instance of RequestParser and call instance.parse', () => {
      let params = {};
      let expected = 'ok';

      RequestParser.prototype.parse.returns('ok');

      let actual = RequestParser.parse(params);
      nassert.assert(actual, expected);

      nassert.assertFn({ inst: RequestParser.prototype, fnName: 'parse', expectedArgs: '_without-args_' });
    });
  });

  describe('parse', () => {
    it('should call related methods and return request model', () => {
      let parser = getParserInstance('plainRequest');
      sinon.stub(parser, '_parseMessageForRows');
      sinon.stub(parser, '_parseHostRow');
      sinon.stub(parser, '_parseStartRow');
      sinon.stub(parser, '_parseHeaderRows');
      sinon.stub(parser, '_parseCookiesRow');
      sinon.stub(parser, '_parseBodyRows');
      sinon.stub(parser, '_generateModel').returns('requestModel');

      let expected = 'requestModel';
      let actual = parser.parse();
      should(actual).eql(expected);

      nassert.assertFn({ inst: parser, fnName: '_parseMessageForRows', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_parseHostRow', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_parseStartRow', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_parseHeaderRows', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_parseCookiesRow', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_parseBodyRows', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_generateModel', expectedArgs: '_without-args_' });
    });
  });

  describe('_parseMessageForRows', () => {
    it('should parse message for rows, when headers does not contain Cookies row', () => {
      let plainRequest = [
        'start-line',
        'host: somehost',
        'header1',
        'header2',
        'header3',
        '',
        'body'
      ].join('\n');

      let parser = getParserInstance(plainRequest);
      parser._parseMessageForRows();

      should(parser.startRow).eql('start-line');
      should(parser.hostRow).eql('host: somehost');
      should(parser.headerRows).eql(['header1', 'header2', 'header3']);
      should(parser.cookiesRow).is.undefined;
      should(parser.bodyRows).eql('body');
    });

    it('should parse message for rows when headers contain Cookies row', () => {
      let plainRequest = [
        'start-line',
        'host: somehost',
        'header1',
        'header2',
        'header3',
        'cookie: somecookies',
        '',
        'body'
      ].join('\n');

      let parser = getParserInstance(plainRequest);
      parser._parseMessageForRows();

      should(parser.startRow).eql('start-line');
      should(parser.hostRow).eql('host: somehost');
      should(parser.headerRows).eql(['header1', 'header2', 'header3']);
      should(parser.cookiesRow).eql('cookie: somecookies');
      should(parser.bodyRows).eql('body');
    });
  });

  describe('_parseHostRow', () => {
    it('should throw error when hostRow is nil', () => {
      let parser = getParserInstance();
      parser.hostRow = null;

      should(parser._parseHostRow.bind(parser)).throw(HttpZError, {
        message: 'host header is required'
      });
    });

    it('should throw error when host header value is empy', () => {
      let parser = getParserInstance();
      parser.hostRow = 'Host:';

      should(parser._parseHostRow.bind(parser)).throw(HttpZError, {
        message: 'host header value must be not empty string'
      });
    });

    it('should throw error when host header value is not valid URL', () => {
      let parser = getParserInstance();
      parser.hostRow = 'Host: ?!invalid-host';

      should(parser._parseHostRow.bind(parser)).throw(HttpZError, {
        message: 'Invalid host',
        details: '?!invalid-host'
      });
    });

    it('should set instance.host when host header value is valid URL', () => {
      let parser = getParserInstance();
      parser.hostRow = 'Host: www.example.com:2345';

      let expected = 'www.example.com:2345';
      parser._parseHostRow();
      should(parser.host).eql(expected);
    });
  });

  describe('_parseStartRow', () => {
    function test({ startRow, expected }) {
      let parser = getParserInstance();
      parser.startRow = startRow;
      parser.host = 'example.com';

      parser._parseStartRow();
      should(parser.method).eql(expected.method);
      should(parser.protocol).eql(expected.protocol);
      should(parser.protocolVersion).eql(expected.protocolVersion);
      should(parser.path).eql(expected.path);
      should(parser.params).eql(expected.params);
    }

    function getDefaultExpected(ex) {
      let def = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        path: '/features',
        host: 'example.com',
        queryParams: []
      };
      return _.extend(def, ex);
    }

    it('should throw error when startRow has invalid format', () => {
      let parser = getParserInstance();
      parser.startRow = 'Invalid request startRow';

      should(parser._parseStartRow.bind(parser)).throw(HttpZError, {
        message: 'Incorrect startRow format, expected: Method SP Request-URI SP HTTP-Version CRLF',
        details: 'Invalid request startRow'
      });
    });

    it('should parse valid startRow (GET method)', () => {
      let startRow = 'get /features http/1.1';
      let expected = getDefaultExpected();

      test({ startRow, expected });
    });

    it('should parse valid startRow (DELETE method)', () => {
      let startRow = 'DELETE /features HTTP/1.1';
      let expected = getDefaultExpected({
        method: 'DELETE'
      });

      test({ startRow, expected });
    });

    it('should parse valid startRow (path is empty)', () => {
      let startRow = 'GET / HTTP/1.1';
      let expected = getDefaultExpected({
        path: '/'
      });

      test({ startRow, expected });
    });

    it('should parse valid startRow (path with two parameters)', () => {
      let startRow = 'GET /features?p1=v1&p2=v2 HTTP/1.1';
      let expected = getDefaultExpected({
        queryParams: [
          { name: 'p1', value: 'v1' },
          { name: 'p2', value: 'v2' }
        ]
      });

      test({ startRow, expected });
    });

    it('should parse valid startRow (HTTP protocol v2.0)', () => {
      let startRow = 'GET /features HTTP/2.0';
      let expected = getDefaultExpected({
        protocolVersion: 'HTTP/2.0'
      });

      test({ startRow, expected });
    });
  });

  describe('_parseCookiesRow', () => {
    it('should throw error when cookiesRow has invalid format', () => {
      let parser = getParserInstance();
      parser.cookiesRow = 'Cookie values';

      should(parser._parseCookiesRow.bind(parser)).throw(HttpZError, {
        message: 'Incorrect cookie row format, expected: Cookie: Name1=Value1;...',
        details: 'Cookie values'
      });
    });

    it('should throw error when cookie values have invalid format', () => {
      let parser = getParserInstance();
      parser.cookiesRow = 'Cookie: csrftoken=123abc;=val';

      should(parser._parseCookiesRow.bind(parser)).throw(HttpZError, {
        message: 'Incorrect cookie pair format, expected: Name1=Value1;...',
        details: 'csrftoken=123abc;=val'
      });
    });

    it('should set instance.cookies to null when cookiesRow is empty', () => {
      let parser = getParserInstance();
      parser.cookiesRow = null;

      let expected = null;
      parser._parseCookiesRow();
      should(parser.cookies).eql(expected);
    });

    it('should set instance.cookies when cookiesRow is valid and not empty', () => {
      let parser = getParserInstance();
      parser.cookiesRow = 'Cookie: csrftoken=123abc;sessionid=456def;username=';

      let expected = [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '456def' },
        { name: 'username', value: null }
      ];
      parser._parseCookiesRow();
      should(parser.cookies).eql(expected);
    });
  });

  describe('_generateModel', () => {
    it('should generate request model using instance fields', () => {
      let parser = getParserInstance();
      parser.method = 'method';
      parser.protocol = 'protocol';
      parser.protocolVersion = 'protocolVersion';
      parser.path = 'path';
      parser.host = 'host';
      parser.queryParams = 'queryParams';
      parser.headers = 'headers';
      parser.cookies = 'cookies';
      parser.body = 'body';

      let expected = {
        method: 'method',
        protocol: 'protocol',
        protocolVersion: 'protocolVersion',
        path: 'path',
        host: 'host',
        queryParams: 'queryParams',
        headers: 'headers',
        cookies: 'cookies',
        body: 'body'
      };
      let actual = parser._generateModel();
      should(actual).eql(expected);
    });
  });

  describe('functional tests', () => {
    it('should parse request without body and headers', () => {
      let plainRequest = [
        'get /features?p1=v1 http/1.1',
        'host: www.example.com',
        '',
        ''
      ].join('\n');

      let requestModel = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'www.example.com',
        path: '/features',
        queryParams: [
          { name: 'p1', value: 'v1' }
        ],
        headers: [],
        cookies: null,
        body: null
      };

      let parser = getParserInstance(plainRequest);
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request without body (header names in lower case)', () => {
      let plainRequest = [
        'get /features http/1.1',
        'host: example.com',
        'connection: keep-alive',
        'accept: */*',
        'accept-Encoding: gzip,deflate',
        'accept-language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0',
        '',
        ''
      ].join('\n');

      let requestModel = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        queryParams: [],
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
            ]
          },
          {
            name: 'User-Agent',
            values: [
              { value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0', params: null }
            ]
          }
        ],
        cookies: null,
        body: null
      };

      let parser = getParserInstance(plainRequest);
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request with cookies and without body', () => {
      let plainRequest = [
        'GET /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Cookie: csrftoken=123abc;sessionid=456def',
        '',
        ''
      ].join('\n');

      let requestModel = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        queryParams: [],
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
            ]
          }
        ],
        cookies: [
          { name: 'csrftoken', value: '123abc' },
          { name: 'sessionid', value: '456def' }
        ],
        body: null
      };

      let parser = getParserInstance(plainRequest);
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request with body and contentType=text/plain', () => {
      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        'Plain text'
      ].join('\n');

      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        queryParams: [],
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
            ]
          },
          {
            name: 'Content-Type',
            values: [
              { value: 'text/plain', params: 'charset=UTF-8' }
            ]
          },
          {
            name: 'Content-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Content-Length',
            values: [
              { value: '301', params: null }
            ]
          }
        ],
        cookies: null,
        body: {
          contentType: 'text/plain',
          plain: 'Plain text'
        }
      };

      let parser = getParserInstance(plainRequest);
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request with body and contentType=application/json', () => {
      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: application/json; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        '{"p1":"v1","p2":"v2"}'
      ].join('\n');

      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        queryParams: [],
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
            ]
          },
          {
            name: 'Content-Type',
            values: [
              { value: 'application/json', params: 'charset=UTF-8' }
            ]
          },
          {
            name: 'Content-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Content-Length',
            values: [
              { value: '301', params: null }
            ]
          }
        ],
        cookies: null,
        body: {
          contentType: 'application/json',
          json: { p1: 'v1', p2: 'v2' }
        }
      };

      let parser = getParserInstance(plainRequest);
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request with body and contentType=application/x-www-form-urlencoded', () => {
      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        'id=11&message=Hello'
      ].join('\n');

      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        queryParams: [],
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
            ]
          },
          {
            name: 'Content-Type',
            values: [
              { value: 'application/x-www-form-urlencoded', params: 'charset=UTF-8' }
            ]
          },
          {
            name: 'Content-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Content-Length',
            values: [
              { value: '301', params: null }
            ]
          }
        ],
        cookies: null,
        body: {
          contentType: 'application/x-www-form-urlencoded',
          formDataParams: [
            { name: 'id', value: '11' },
            { name: 'message', value: 'Hello' }
          ]
        }
      };

      let parser = getParserInstance(plainRequest);
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request with body and contentType=multipart/form-data', () => {
      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: multipart/form-data; boundary=11136253119209',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        '--11136253119209',
        'Content-Disposition: form-data; name="Name"',
        '',
        'Smith',
        '--11136253119209',
        'Content-Disposition: form-data; name="Age"',
        '',
        '25',
        '--11136253119209--'
      ].join('\n');

      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        queryParams: [],
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*', params: null }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU', params: null },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
            ]
          },
          {
            name: 'Content-Type',
            values: [
              { value: 'multipart/form-data', params: 'boundary=11136253119209' }
            ]
          },
          {
            name: 'Content-Encoding',
            values: [
              { value: 'gzip', params: null },
              { value: 'deflate', params: null }
            ]
          },
          {
            name: 'Content-Length',
            values: [
              { value: '301', params: null }
            ]
          }
        ],
        cookies: null,
        body: {
          contentType: 'multipart/form-data',
          boundary: '11136253119209',
          formDataParams: [
            { name: 'Name', value: 'Smith' },
            { name: 'Age', value: '25' }
          ]
        }
      };

      let parser = getParserInstance(plainRequest);
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });
  });
});
