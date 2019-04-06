'use strict';

const sinon          = require('sinon');
const should         = require('should');
const nassert        = require('n-assert');
const ResponseParser = require('../../src/parsers/response');

describe('parsers / response', () => {
  function getParserInstance(params) {
    return new ResponseParser(params);
  }

  describe('static parse', () => {
    beforeEach(() => {
      sinon.stub(ResponseParser.prototype, 'parse');
    });

    afterEach(() => {
      ResponseParser.prototype.parse.restore();
    });

    it('should create an instance of ResponseParser and call instance.parse', () => {
      let params = {};
      let expected = 'ok';

      ResponseParser.prototype.parse.returns('ok');

      let actual = ResponseParser.parse(params);
      nassert.assert(actual, expected);

      nassert.assertFn({ inst: ResponseParser.prototype, fnName: 'parse', expectedArgs: '_without-args_' });
    });
  });

  describe('parse', () => {
    it('should call related methods and return response model', () => {
      let parser = getParserInstance({ httpMessage: 'responseMsg' });
      sinon.stub(parser, '_parseMessageForRows');
      sinon.stub(parser, '_parseStartRow');
      sinon.stub(parser, '_parseHeaderRows');
      sinon.stub(parser, '_parseCookieRows');
      sinon.stub(parser, '_parseBodyRows');
      sinon.stub(parser, '_generateModel').returns('responseModel');

      let expected = 'responseModel';
      let actual = parser.parse();
      should(actual).eql(expected);

      nassert.assertFn({ inst: parser, fnName: '_parseMessageForRows', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_parseStartRow', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_parseHeaderRows', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_parseCookieRows', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_parseBodyRows', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: parser, fnName: '_generateModel', expectedArgs: '_without-args_' });
    });
  });

  describe('_parseMessageForRows', () => {
    it('should parse message for rows, when headers does not contain Set-Cookie rows', () => {
      let responseMsg = [
        'start-line',
        'Header1',
        'Header2',
        'Header3',
        '',
        'Body'
      ].join('\n');

      let parser = getParserInstance({ httpMessage: responseMsg });
      parser._parseMessageForRows();

      should(parser.startRow).eql('start-line');
      should(parser.headerRows).eql(['Header1', 'Header2', 'Header3']);
      should(parser.cookieRows).eql([]);
      should(parser.bodyRows).eql('Body');
    });

    it('should parse message for rows, when headers contain Set-Cookie rows', () => {
      let responseMsg = [
        'start-line',
        'Header1',
        'Header2',
        'Header3',
        'set-Cookie',
        'Set-cookie',
        '',
        'Body'
      ].join('\n');

      let parser = getParserInstance({ httpMessage: responseMsg });
      parser._parseMessageForRows();

      should(parser.startRow).eql('start-line');
      should(parser.headerRows).eql(['Header1', 'Header2', 'Header3']);
      should(parser.cookieRows).eql(['set-Cookie', 'Set-cookie']);
      should(parser.bodyRows).eql('Body');
    });
  });

  describe('_parseStartRow', () => {
    it('should throw error when startRow has invalid format', () => {
      let parser = getParserInstance();
      parser.startRow = 'Invalid response startRow';

      should(parser._parseStartRow.bind(parser)).throw(Error, {
        message: 'Incorrect startRow format, expected: HTTP-Version SP Status-Code SP Status-Message CRLF.\nDetails: "Invalid response startRow"'
      });
    });

    it('should init instance fields when startRow has valid format', () => {
      let parser = getParserInstance();
      parser.startRow = 'http/1.1 201 Created';

      parser._parseStartRow();
      should(parser.protocolVersion).eql('HTTP/1.1');
      should(parser.statusCode).eql(201);
      should(parser.statusMessage).eql('Created');
    });
  });

  describe('_parseCookieRows', () => {
    function getDefaultCookies() {
      return [
        'Set-Cookie: csrftoken=123abc',
        'Set-Cookie: sessionid=; Domain=example.com; Path=/',
        'Set-Cookie: username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly',
      ];
    }

    it('should throw error when some of cookieRows has invalid format (empty values)', () => {
      let parser = getParserInstance();
      parser.cookieRows = getDefaultCookies();
      parser.cookieRows[1] = 'Set-cookie:    ';

      should(parser._parseCookieRows.bind(parser)).throw(Error, {
        message: 'Incorrect set-cookie row format, expected: Set-Cookie: Name1=Value1;....\nDetails: "Set-cookie:    "'
      });
    });

    it('should throw error when some of cookieRows has invalid format (empty cookie name)', () => {
      let parser = getParserInstance();
      parser.cookieRows = getDefaultCookies();
      parser.cookieRows[1] = 'Set-cookie:  =456def;  Domain=example.com;';

      should(parser._parseCookieRows.bind(parser)).throw(Error, {
        message: 'Incorrect cookie pair format, expected: Name1=Value1;....\nDetails: "=456def;  Domain=example.com;"'
      });
    });

    it('should set instance.cookies to null when cookieRows is an empty array', () => {
      let parser = getParserInstance();
      parser.cookieRows = [];

      let expected = null;
      parser._parseCookieRows();
      should(parser.cookies).eql(expected);
    });

    it('should set instance.cookies when cookieRows is not an empty array', () => {
      let parser = getParserInstance();
      parser.cookieRows = getDefaultCookies();

      let expected = [
        { name: 'csrftoken', value: '123abc', params: null },
        { name: 'sessionid', value: null, params: ['Domain=example.com', 'Path=/'] },
        { name: 'username', value: 'smith', params: ['Expires=Wed, 21 Oct 2015 07:28:00 GMT', 'Secure', 'HttpOnly'] }
      ];
      parser._parseCookieRows();
      should(parser.cookies).eql(expected);
    });
  });

  describe('_generateModel', () => {
    it('should generate response model using instance fields', () => {
      let parser = getParserInstance();
      parser.protocolVersion = 'protocolVersion';
      parser.statusCode = 'statusCode';
      parser.statusMessage = 'statusMessage';
      parser.headers = 'headers';
      parser.cookies = 'cookies';
      parser.body = 'body';

      let expected = {
        protocolVersion: 'protocolVersion',
        statusCode: 'statusCode',
        statusMessage: 'statusMessage',
        headers: 'headers',
        cookies: 'cookies',
        body: 'body'
      };
      let actual = parser._generateModel();
      should(actual).eql(expected);
    });
  });

  describe('functional tests', () => {
    it('should parse response without body (header names in lower case)', () => {
      let responseMsg = [
        'http/1.1 201 Created',
        'connection: keep-alive',
        'cache-Control: no-cache',
        'Content-type: text/plain; charset=UTF-8',
        'content-encoding: gzip,deflate',
        '',
        ''
      ].join('\n');

      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 201,
        statusMessage: 'Created',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Cache-Control',
            values: [
              { value: 'no-cache', params: null }
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
          }
        ],
        cookies: null,
        body: null
      };

      let parser = getParserInstance({ httpMessage: responseMsg });
      let actual = parser.parse();
      should(actual).eql(responseModel);
    });

    it('should parse response without cookies and without body', () => {
      let responseMsg = [
        'http/1.1 201 Created',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Set-Cookie: csrftoken=123abc',
        'Set-Cookie: sessionid=456def; Domain=example.com; Path=/',
        'Set-Cookie: username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly',
        '',
        ''
      ].join('\n');

      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 201,
        statusMessage: 'Created',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Cache-Control',
            values: [
              { value: 'no-cache', params: null }
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
          }
        ],
        cookies: [
          { name: 'csrftoken', value: '123abc', params: null },
          { name: 'sessionid', value: '456def', params: ['Domain=example.com', 'Path=/'] },
          { name: 'username', value: 'smith', params: ['Expires=Wed, 21 Oct 2015 07:28:00 GMT', 'Secure', 'HttpOnly'] }
        ],
        body: null
      };

      let parser = getParserInstance({ httpMessage: responseMsg });
      let actual = parser.parse();
      should(actual).eql(responseModel);
    });

    it('should parse response with body and contentType=text/plain', () => {
      let responseMsg = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        'Plain text'
      ].join('\n');

      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 200,
        statusMessage: 'Ok',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Cache-Control',
            values: [
              { value: 'no-cache', params: null }
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

      let parser = getParserInstance({ httpMessage: responseMsg });
      let actual = parser.parse();
      should(actual).eql(responseModel);
    });

    it('should parse response with body and contentType=application/json', () => {
      let responseMsg = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: application/json; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        '{"p1":"v1","p2":"v2"}'
      ].join('\n');

      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 200,
        statusMessage: 'Ok',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive', params: null }
            ]
          },
          {
            name: 'Cache-Control',
            values: [
              { value: 'no-cache', params: null }
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

      let parser = getParserInstance({ httpMessage: responseMsg });
      let actual = parser.parse();
      should(actual).eql(responseModel);
    });
  });
});
