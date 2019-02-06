'use strict';

const sinon         = require('sinon');
const should        = require('should');
const nassert       = require('n-assert');
const RequestParser = require('../../src/parser/request');

describe('parser / request', () => {
  function getParserInstance(requestMsg, eol) {
    return new RequestParser(requestMsg, eol);
  }

  describe('parse', () => {
    it('should call related methods and return request object', () => {
      let parser = getParserInstance('requestMsg');
      sinon.stub(parser, '_parseMessageForRows');
      sinon.stub(parser, '_parseStartRow');
      sinon.stub(parser, '_parseHostRow');
      sinon.stub(parser, '_parseHeaderRows');
      sinon.stub(parser, '_parseCookiesRow');
      sinon.stub(parser, '_parseBodyRows');
      sinon.stub(parser, '_generateObj').returns('requestObj');

      let expected = 'requestObj';
      let actual = parser.parse();
      should(actual).eql(expected);

      nassert.validateCalledFn({ srvc: parser, fnName: '_parseMessageForRows', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_parseStartRow', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_parseHostRow', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_parseHeaderRows', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_parseCookiesRow', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_parseBodyRows', expectedArgs: '_without-args_' });
      nassert.validateCalledFn({ srvc: parser, fnName: '_generateObj', expectedArgs: '_without-args_' });
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
        '',
        'Body'
      ].join('\n');
      let parser = getParserInstance(requestMsg);

      parser._parseMessageForRows();
      should(parser.startRow).eql('start-line');
      should(parser.hostRow).eql('host-line');
      should(parser.headerRows).eql(['Header1:', 'Header2:', 'Header3:']);
      should(parser.cookiesRow).eql('Cookie:');
      should(parser.bodyRows).eql('Body');
    });
  });

  describe('_generateObj', () => {
    it('should generate request object using instance fields', () => {
      let parser = getParserInstance();
      parser.method = 'method';
      parser.protocol = 'protocol';
      parser.protocolVersion = 'protocolVersion';
      parser.url = 'url';
      parser.host = 'host';
      parser.headers = 'headers';
      parser.cookies = 'cookies';
      parser.body = 'body';

      let expected = {
        method: 'method',
        protocol: 'protocol',
        protocolVersion: 'protocolVersion',
        url: 'url',
        host: 'host',
        headers: 'headers',
        cookies: 'cookies',
        body: 'body'
      };

      let actual = parser._generateObj();
      should(actual).eql(expected);
    });
  });

  describe('_parseStartRow', () => {
    it('should throw exception when startRow has invalid format', () => {
      let parser = getParserInstance();
      parser.startRow = 'Invalid request startRow';

      should(parser._parseStartRow.bind(parser)).throw(Error, {
        message: 'Method SP Request-URI SP HTTP-Version CRLF. Data: Invalid request startRow'
      });
    });

    it('should init instance fields when startRow has valid format', () => {
      let parser = getParserInstance();
      parser.startRow = 'GET http://example.com HTTP/1.1';

      parser._parseStartRow();
      should(parser.method).eql('GET');
      should(parser.url).eql('example.com');
      should(parser.protocol).eql('HTTP');
      should(parser.protocolVersion).eql('HTTP/1.1');
    });
  });

  describe('_parseHostRow', () => {
    it('should throw exception when hostRow has invalid format', () => {
      let parser = getParserInstance();
      parser.hostRow = 'Invalid request hostRow';

      should(parser._parseHostRow.bind(parser)).throw(Error, {
        message: 'Host row must be in format: Host: Value. Data: Invalid request hostRow'
      });
    });

    it('should init instance fields when hostRow has valid format', () => {
      let parser = getParserInstance();
      parser.hostRow = 'Host: example.com';

      parser._parseHostRow();
      should(parser.host).eql('example.com');
    });
  });

  describe('functional tests', () => {
    it('should parse request without body', () => {
      let requestMsg = [
        'GET http://example.com/features?p1=v1 HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        '',
        ''
      ].join('\n');

      let requestObj = {
        method: 'GET',
        protocol: 'HTTP',
        url: 'example.com/features?p1=v1',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
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

      let parser = getParserInstance(requestMsg);
      let actual = parser.parse();
      should(actual).eql(requestObj);
    });

    it('should parse request with cookies and without body', () => {
      let requestMsg = [
        'GET http://example.com/features?p1=v1 HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Cookie: csrftoken=123abc;sessionid=456def',
        '',
        ''
      ].join('\n');

      let requestObj = {
        method: 'GET',
        protocol: 'HTTP',
        url: 'example.com/features?p1=v1',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
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

      let parser = getParserInstance(requestMsg);
      let actual = parser.parse();
      should(actual).eql(requestObj);
    });

    it('should parse request with body and contentType=text/plain', () => {
      let requestMsg = [
        'GET http://example.com/features?p1=v1 HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        '',
        'Plain text'
      ].join('\n');

      let requestObj = {
        method: 'GET',
        protocol: 'HTTP',
        url: 'example.com/features?p1=v1',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
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

      let parser = getParserInstance(requestMsg);
      let actual = parser.parse();
      should(actual).eql(requestObj);
    });

    it('should parse request with body and contentType=application/json', () => {
      let requestMsg = [
        'GET http://example.com/features?p1=v1 HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: application/json; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        '',
        '{"p1":"v1","p2":"v2"}'
      ].join('\n');

      let requestObj = {
        method: 'GET',
        protocol: 'HTTP',
        url: 'example.com/features?p1=v1',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
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

      let parser = getParserInstance(requestMsg);
      let actual = parser.parse();
      should(actual).eql(requestObj);
    });

    it('should parse request with body and contentType=application/x-www-form-urlencoded', () => {
      let requestMsg = [
        'GET http://example.com/features?p1=v1 HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        '',
        'id=11&message=Hello'
      ].join('\n');

      let requestObj = {
        method: 'GET',
        protocol: 'HTTP',
        url: 'example.com/features?p1=v1',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
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

      let parser = getParserInstance(requestMsg);
      let actual = parser.parse();
      should(actual).eql(requestObj);
    });

    it('should parse request with body and contentType=multipart/form-data', () => {
      let requestMsg = [
        'GET http://example.com/features?p1=v1 HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: multipart/form-data; boundary=------11136253119209',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
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

      let requestObj = {
        method: 'GET',
        protocol: 'HTTP',
        url: 'example.com/features?p1=v1',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
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

      let parser = getParserInstance(requestMsg);
      let actual = parser.parse();
      should(actual).eql(requestObj);
    });
  });
});
