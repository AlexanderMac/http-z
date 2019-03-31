'use strict';

const sinon         = require('sinon');
const should        = require('should');
const nassert       = require('n-assert');
const RequestParser = require('../../src/parsers/request');

describe('parsers / request', () => {
  function getParserInstance(params) {
    return new RequestParser(params);
  }

  describe('parse', () => {
    it('should call related methods and return request model', () => {
      let parser = getParserInstance({ httpMessage: 'requestMsg' });
      sinon.stub(parser, '_parseMessageForRows');
      sinon.stub(parser, '_parseStartRow');
      sinon.stub(parser, '_parseHeaderRows');
      sinon.stub(parser, '_parseCookiesRow');
      sinon.stub(parser, '_parseBodyRows');
      sinon.stub(parser, '_generateModel').returns('requestModel');

      let expected = 'requestModel';
      let actual = parser.parse();
      should(actual).eql(expected);

      nassert.validateCalledFn({ srvc: parser, fnName: '_parseMessageForRows', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_parseStartRow', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_parseHeaderRows', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_parseCookiesRow', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_parseBodyRows', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_generateModel', expectedArgs: '_without-args_' });
    });
  });

  describe('_parseMessageForRows', () => {
    it('should parse message for rows', () => {
      let requestMsg = [
        'start-line',
        'host-line',
        'Header1:',
        'Header2:',
        'Header3:',
        'Cookie:',
        '',
        'Body'
      ].join('\n');
      let parser = getParserInstance({ httpMessage: requestMsg });

      parser._parseMessageForRows();
      should(parser.startRow).eql('start-line');
      should(parser.hostRow).eql('host-line');
      should(parser.headerRows).eql(['Header1:', 'Header2:', 'Header3:']);
      should(parser.cookiesRow).eql('Cookie:');
      should(parser.bodyRows).eql('Body');
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
      parser.params = 'params';
      parser.basicAuth = 'basicAuth';
      parser.headers = 'headers';
      parser.cookies = 'cookies';
      parser.body = 'body';

      let expected = {
        method: 'method',
        protocol: 'protocol',
        protocolVersion: 'protocolVersion',
        path: 'path',
        host: 'host',
        params: 'params',
        basicAuth: 'basicAuth',
        headers: 'headers',
        cookies: 'cookies',
        body: 'body'
      };

      let actual = parser._generateModel();
      should(actual).eql(expected);
    });
  });

  describe('_parseStartRow', () => {
    it('should throw error when startRow has invalid format', () => {
      let parser = getParserInstance();
      parser.startRow = 'Invalid request startRow';

      should(parser._parseStartRow.bind(parser)).throw(Error, {
        message: 'Method SP Request-URI SP HTTP-Version CRLF. Data: Invalid request startRow'
      });
    });

    it('should init instance fields when startRow has valid format', () => {
      let parser = getParserInstance();
      parser.startRow = 'get http://example.com/features?p1=v1 http/1.1';

      parser._parseStartRow();
      should(parser.method).eql('GET');
      should(parser.protocol).eql('HTTP');
      should(parser.protocolVersion).eql('HTTP/1.1');
      should(parser.path).eql('/features');
      should(parser.host).eql('example.com');
      should(parser.params).eql({ p1: 'v1' });
      should(parser.basicAuth).eql({});
    });
  });

  describe('functional tests', () => {
    it('should parse request without body and headers', () => {
      let requestMsg = [
        'get http://admin:pass@example.com/features?p1=v1 http/1.1',
        'host: example.com',
        '',
        ''
      ].join('\n');

      let requestModel = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        params: { p1: 'v1' },
        basicAuth: {
          username: 'admin',
          password: 'pass'
        },
        headers: [],
        cookies: null,
        body: null
      };

      let parser = getParserInstance({ httpMessage: requestMsg });
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request without body (header names in lower case)', () => {
      let requestMsg = [
        'get http://example.com/features http/1.1',
        'host: example.com',
        'connection: keep-alive',
        'accept: */*',
        'accept-Encoding: gzip,deflate',
        'accept-language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        '',
        ''
      ].join('\n');

      let requestModel = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        params: {},
        basicAuth: {},
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
        cookies: null,
        body: null
      };

      let parser = getParserInstance({ httpMessage: requestMsg });
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request with cookies and without body', () => {
      let requestMsg = [
        'GET http://example.com/features HTTP/1.1',
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
        params: {},
        basicAuth: {},
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

      let parser = getParserInstance({ httpMessage: requestMsg });
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request with body and contentType=text/plain', () => {
      let requestMsg = [
        'POST http://example.com/features HTTP/1.1',
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
        params: {},
        basicAuth: {},
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

      let parser = getParserInstance({ httpMessage: requestMsg });
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request with body and contentType=application/json', () => {
      let requestMsg = [
        'POST http://example.com/features HTTP/1.1',
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
        params: {},
        basicAuth: {},
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

      let parser = getParserInstance({ httpMessage: requestMsg });
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request with body and contentType=application/x-www-form-urlencoded', () => {
      let requestMsg = [
        'POST http://example.com/features HTTP/1.1',
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
        params: {},
        basicAuth: {},
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

      let parser = getParserInstance({ httpMessage: requestMsg });
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });

    it('should parse request with body and contentType=multipart/form-data', () => {
      let requestMsg = [
        'POST http://example.com/features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: multipart/form-data; boundary=------11136253119209',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        '-----------------------------11136253119209',
        'Content-Disposition: form-data; name="Name"',
        '',
        'Smith',
        '-----------------------------11136253119209',
        'Content-Disposition: form-data; name="Age"',
        '',
        '25',
        '-----------------------------11136253119209--'
      ].join('\n');

      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        params: {},
        basicAuth: {},
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
              { value: 'multipart/form-data', params: 'boundary=------11136253119209' }
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
          boundary: '------11136253119209',
          formDataParams: [
            { name: 'Name', value: 'Smith' },
            { name: 'Age', value: '25' }
          ]
        }
      };

      let parser = getParserInstance({ httpMessage: requestMsg });
      let actual = parser.parse();
      should(actual).eql(requestModel);
    });
  });
});
