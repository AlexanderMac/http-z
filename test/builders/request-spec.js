'use strict';

const _              = require('lodash');
const sinon          = require('sinon');
const should         = require('should');
const nassert        = require('n-assert');
const HttpZError     = require('../../src/error');
const RequestBuilder = require('../../src/builders/request');

describe('builders / request', () => {
  function getBuilderInstance(exRequestModel) {
    let requestModel = _.extend({
      method: 'get',
      protocol: 'http',
      protocolVersion: 'http/1.1',
      host: 'example.com',
      path: '/'
    }, exRequestModel);
    return new RequestBuilder(requestModel);
  }

  describe('static build', () => {
    beforeEach(() => {
      sinon.stub(RequestBuilder.prototype, 'build');
    });

    afterEach(() => {
      RequestBuilder.prototype.build.restore();
    });

    it('should create an instance of RequestBuilder and call instance.build', () => {
      let model = {};
      let expected = 'ok';

      RequestBuilder.prototype.build.returns('ok');

      let actual = RequestBuilder.build(model);
      nassert.assert(actual, expected);

      nassert.assertFn({ inst: RequestBuilder.prototype, fnName: 'build', expectedArgs: '_without-args_' });
    });
  });

  describe('build', () => {
    it('should call related methods and return request message', () => {
      let builder = getBuilderInstance();
      sinon.stub(builder, '_generateStartRow').returns('startRow\n');
      sinon.stub(builder, '_generateHostRow').returns('hostRow\n');
      sinon.stub(builder, '_generateHeaderRows').returns('headerRows\n');
      sinon.stub(builder, '_generateCookiesRow').returns('cookieRow\n');
      sinon.stub(builder, '_generateBodyRows').returns('bodyRows');

      let expected = 'startRow\nhostRow\nheaderRows\ncookieRow\nbodyRows';
      let actual = builder.build();
      should(actual).eql(expected);

      nassert.assertFn({ inst: builder, fnName: '_generateStartRow', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: builder, fnName: '_generateHostRow', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: builder, fnName: '_generateHeaderRows', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: builder, fnName: '_generateCookiesRow', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: builder, fnName: '_generateBodyRows', expectedArgs: '_without-args_' });
    });
  });

  describe('_generateStartRow', () => {
    it('should throw error when method is not defined', () => {
      let builder = getBuilderInstance({ method: undefined });

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'method is required'
      });
    });

    it('should throw error when protocol is not defined', () => {
      let builder = getBuilderInstance({ protocol: undefined });

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'protocol is required'
      });
    });

    it('should throw error when protocolVersion is not defined', () => {
      let builder = getBuilderInstance({ protocolVersion: undefined });

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'protocolVersion is required'
      });
    });

    it('should throw error when host is not defined', () => {
      let builder = getBuilderInstance({ host: undefined });

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'host is required'
      });
    });

    it('should throw error when path is not defined', () => {
      let builder = getBuilderInstance({ path: undefined });

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'path is required'
      });
    });

    it('should build startRow when all params are valid', () => {
      let builder = getBuilderInstance();

      let expected = 'GET / HTTP/1.1\n';
      let actual = builder._generateStartRow();
      should(actual).eql(expected);
    });
  });

  describe('_generateHostRow', () => {
    it('should build hostRow', () => {
      let builder = getBuilderInstance({ host: 'example.com' });

      let expected = 'Host: example.com\n';
      let actual = builder._generateHostRow();
      should(actual).eql(expected);
    });
  });

  describe('_generateCookiesRow', () => {
    it('should return empty string when instance.cookies is nil', () => {
      let builder = getBuilderInstance({ cookies: undefined });

      let expected = '';
      let actual = builder._generateCookiesRow();
      should(actual).eql(expected);
    });

    it('should throw error when instance.cookies is not array', () => {
      let builder = getBuilderInstance({ cookies: 'wrong cookies' });

      should(builder._generateCookiesRow.bind(builder)).throw(HttpZError, {
        message: 'cookies must be an array'
      });
    });

    it('should throw error when instance.cookies is an empty array', () => {
      let builder = getBuilderInstance({ cookies: [] });

      should(builder._generateCookiesRow.bind(builder)).throw(HttpZError, {
        message: 'cookies must be not empty array'
      });
    });

    it('should throw error when instance.cookies contains element with undefined name', () => {
      let builder = getBuilderInstance({
        cookies: [
          { name: 'c1', value: 'v1' },
          { value: 'v2' }
        ]
      });

      should(builder._generateCookiesRow.bind(builder)).throw(HttpZError, {
        message: 'cookie name is required',
        details: 'cookie index: 1'
      });
    });

    it('should build cookies row when instance.cookies are valid', () => {
      let builder = getBuilderInstance({
        cookies: [
          { name: 'c1', value: 'v1' },
          { name: 'c2', value: 'v2' },
          { name: 'c3' }
        ]
      });

      let expected = 'Cookie: c1=v1; c2=v2; c3=\n';
      let actual = builder._generateCookiesRow();
      should(actual).eql(expected);
    });
  });

  describe('functional tests', () => {
    it('should build request without headers and body', () => {
      let requestModel = {
        method: 'GET',
        protocol: 'HTTPS',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        queryParams: [
          { name: 'p1', value: 'v1' },
          { name: 'p2' }
        ],
        headers: []
      };

      let plainRequest = [
        'GET /features?p1=v1&p2= HTTP/1.1',
        'Host: example.com',
        '',
        ''
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(plainRequest);
    });

    it('should build request message without body (names in lower case)', () => {
      let requestModel = {
        method: 'get',
        protocol: 'http',
        protocolVersion: 'http/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'connection',
            values: []
          },
          {
            name: 'accept',
            values: [
              { value: '*/*' }
            ]
          },
          {
            name: 'cache-Control',
            values: [
              { value: 'no-cache' }
            ]
          },
          {
            name: 'content-encoding',
            values: [
              { value: 'gzip' },
              { value: 'deflate' }
            ]
          }
        ]
      };

      let plainRequest = [
        'GET /features HTTP/1.1',
        'Host: example.com',
        'Connection: ',
        'Accept: */*',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        ''
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(plainRequest);
    });

    it('should parse request with cookies and without body', () => {
      let requestModel = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'Connection',
            values: []
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*' }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip' },
              { value: 'deflate' }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU' },
              { value: 'ru', params: 'q=0.8' },
              { value: 'en-US', params: 'q=0.6' },
              { value: 'en', params: 'q=0.4' }
            ]
          }
        ],
        cookies: [
          { name: 'csrftoken', value: '123abc' },
          { name: 'sessionid', value: '456def' },
          { name: 'username' }
        ]
      };

      let plainRequest = [
        'GET /features HTTP/1.1',
        'Host: example.com',
        'Connection: ',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Cookie: csrftoken=123abc; sessionid=456def; username=',
        ''
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(plainRequest);
    });

    it('should parse request with body and contentType=text/plain', () => {
      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive' }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*' }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip' },
              { value: 'deflate' }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU' },
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
              { value: 'gzip' },
              { value: 'deflate' }
            ]
          },
          {
            name: 'Content-Length',
            values: [
              { value: '301' }
            ]
          }
        ],
        body: {
          contentType: 'text/plain',
          plain: 'Plain text'
        }
      };

      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        'Plain text'
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(plainRequest);
    });

    it('should parse request with body and contentType=application/json', () => {
      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive' }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*' }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip' },
              { value: 'deflate' }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU' },
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
              { value: 'gzip' },
              { value: 'deflate' }
            ]
          },
          {
            name: 'Content-Length',
            values: [
              { value: '301' }
            ]
          }
        ],
        body: {
          contentType: 'application/json',
          json: { p1: 'v1', p2: 'v2' }
        }
      };

      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: application/json;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        '{"p1":"v1","p2":"v2"}'
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(plainRequest);
    });

    it('should parse request with body and contentType=application/x-www-form-urlencoded', () => {
      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive' }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*' }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip' },
              { value: 'deflate' }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU' },
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
              { value: 'gzip' },
              { value: 'deflate' }
            ]
          },
          {
            name: 'Content-Length',
            values: [
              { value: '301' }
            ]
          }
        ],
        body: {
          contentType: 'application/x-www-form-urlencoded',
          formDataParams: [
            { name: 'firstName', value: 'John' },
            { name: 'lastName' },
            { name: 'age', value: 25 }
          ]
        }
      };

      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: application/x-www-form-urlencoded;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        'firstName=John&lastName=&age=25'
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(plainRequest);
    });

    it('should parse request with body and contentType=multipart/form-data', () => {
      let requestModel = {
        method: 'POST',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'example.com',
        path: '/features',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive' }
            ]
          },
          {
            name: 'Accept',
            values: [
              { value: '*/*' }
            ]
          },
          {
            name: 'Accept-Encoding',
            values: [
              { value: 'gzip' },
              { value: 'deflate' }
            ]
          },
          {
            name: 'Accept-Language',
            values: [
              { value: 'ru-RU' },
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
              { value: 'gzip' },
              { value: 'deflate' }
            ]
          },
          {
            name: 'Content-Length',
            values: [
              { value: '301' }
            ]
          }
        ],
        body: {
          contentType: 'multipart/form-data',
          boundary: '11136253119209',
          formDataParams: [
            { name: 'firstName', value: 'John' },
            { name: 'lastName' },
            { name: 'age', value: 25 }
          ]
        }
      };

      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: multipart/form-data;boundary=11136253119209',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        '--11136253119209',
        'Content-Disposition: form-data; name="firstName"',
        '',
        'John',
        '--11136253119209',
        'Content-Disposition: form-data; name="lastName"',
        '',
        '',
        '--11136253119209',
        'Content-Disposition: form-data; name="age"',
        '',
        '25',
        '--11136253119209--'
      ].join('\n');

      let builder = getBuilderInstance(requestModel);
      let actual = builder.build();
      should(actual).eql(plainRequest);
    });
  });
});
