const _ = require('lodash');
const sinon = require('sinon');
const should = require('should');
const nassert = require('n-assert');
const HttpZConsts = require('../../src/consts');
const HttpZError = require('../../src/error');
const ResponseBuilder = require('../../src/builders/response');

describe('builders / response', () => {
  function getBuilderInstance(exResponseModel) {
    let responseModel = _.extend({
      protocolVersion: 'http/1.1',
      statusCode: 200,
      statusMessage: 'Ok'
    }, exResponseModel);
    return new ResponseBuilder(responseModel);
  }

  describe('static build', () => {
    beforeEach(() => {
      sinon.stub(ResponseBuilder.prototype, 'build');
    });

    afterEach(() => {
      ResponseBuilder.prototype.build.restore();
    });

    it('should create an instance of ResponseBuilder and call instance.build', () => {
      let model = {};
      let expected = 'ok';

      ResponseBuilder.prototype.build.returns('ok');

      let actual = ResponseBuilder.build(model);
      nassert.assert(actual, expected);

      nassert.assertFn({ inst: ResponseBuilder.prototype, fnName: 'build', expectedArgs: '_without-args_' });
    });
  });

  describe('build', () => {
    it('should call related methods and return response message', () => {
      let builder = getBuilderInstance();
      sinon.stub(builder, '_generateStartRow').returns('startRow' + HttpZConsts.eol);
      sinon.stub(builder, '_generateHeaderRows').returns('headerRows' + HttpZConsts.eol);
      sinon.stub(builder, '_generateBodyRows').returns('bodyRows');

      let expected = [
        'startRow',
        'headerRows',
        'bodyRows'
      ].join(HttpZConsts.eol);
      let actual = builder.build();
      should(actual).eql(expected);

      nassert.assertFn({ inst: builder, fnName: '_generateStartRow', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: builder, fnName: '_generateHeaderRows', expectedArgs: '_without-args_' });
      nassert.assertFn({ inst: builder, fnName: '_generateBodyRows', expectedArgs: '_without-args_' });
    });
  });

  describe('_generateStartRow', () => {
    it('should throw error when protocolVersion is not defined', () => {
      let builder = getBuilderInstance({ protocolVersion: undefined });

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'protocolVersion is required'
      });
    });

    it('should throw error when statusCode is not defined', () => {
      let builder = getBuilderInstance({ statusCode: undefined });

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'statusCode is required'
      });
    });

    it('should throw error when statusMessage is not defined', () => {
      let builder = getBuilderInstance({ statusMessage: undefined });

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'statusMessage is required'
      });
    });

    it('should build startRow when all params are valid', () => {
      let builder = getBuilderInstance();

      let expected = 'HTTP/1.1 200 Ok' + HttpZConsts.eol;
      let actual = builder._generateStartRow();
      should(actual).eql(expected);
    });
  });

  describe('_generateCookieRows', () => {
    function getDefaultCookes() {
      return [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', params: ['Domain=example.com', 'Path=/'] },
        { name: 'username', value: 'smith', params: ['Expires=Wed, 21 Oct 2015 07:28:00 GMT', 'Secure', 'HttpOnly'] }
      ];
    }

    it('should return empty string when instance.cookies is nil', () => {
      let builder = getBuilderInstance({ cookies: undefined });

      let expected = '';
      let actual = builder._generateCookieRows();
      should(actual).eql(expected);
    });

    it('should throw error when instance.cookies is not array', () => {
      let builder = getBuilderInstance({ cookies: 'wrong cookies' });

      should(builder._generateCookieRows.bind(builder)).throw(HttpZError, {
        message: 'cookies must be an array'
      });
    });

    it('should throw error when instance.cookies is an empty array', () => {
      let builder = getBuilderInstance({ cookies: [] });

      should(builder._generateCookieRows.bind(builder)).throw(HttpZError, {
        message: 'cookies must be not empty array'
      });
    });

    it('should throw error when instance.cookies contains element with undefined name', () => {
      let builder = getBuilderInstance({
        cookies: getDefaultCookes()
      });
      builder.cookies[1].name = undefined;

      should(builder._generateCookieRows.bind(builder)).throw(HttpZError, {
        message: 'cookie name is required',
        details: 'cookie index: 1'
      });
    });

    it('should throw error when instance.cookies contains element with non array params', () => {
      let builder = getBuilderInstance({
        cookies: getDefaultCookes()
      });
      builder.cookies[1].params = 'wrong params';

      should(builder._generateCookieRows.bind(builder)).throw(HttpZError, {
        message: 'cookie params must be an array',
        details: 'cookie index: 1'
      });
    });

    it('should build cookie rows when instance.cookies are valid', () => {
      let builder = getBuilderInstance({
        cookies: getDefaultCookes()
      });

      let expected = [
        'Set-Cookie: csrftoken=123abc',
        'Set-Cookie: sessionid=; Domain=example.com; Path=/',
        'Set-Cookie: username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly'
      ].join(HttpZConsts.eol) + HttpZConsts.eol;
      let actual = builder._generateCookieRows();
      should(actual).eql(expected);
    });
  });

  describe('functional tests', () => {
    it('should build response message without body (names in lower case)', () => {
      let responseModel = {
        protocolVersion: 'http/1.1',
        statusCode: 201,
        statusMessage: 'Created',
        headers: [
          {
            name: 'connection',
            values: []
          },
          {
            name: 'cache-Control',
            values: [
              { value: 'no-cache' }
            ]
          },
          {
            name: 'Content-type',
            values: [
              { value: 'text/plain', params: 'charset=UTF-8' }
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

      let plainResponse = [
        'HTTP/1.1 201 Created',
        'Connection: ',
        'Cache-Control: no-cache',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        ''
      ].join(HttpZConsts.eol);

      let builder = getBuilderInstance(responseModel);
      let actual = builder.build();
      should(actual).eql(plainResponse);
    });

    it('should build response message with cookies and without body', () => {
      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 201,
        statusMessage: 'Created',
        headers: [
          {
            name: 'Connection',
            values: []
          },
          {
            name: 'Cache-Control',
            values: [
              { value: 'no-cache' }
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
          }
        ],
        cookies: [
          { name: 'csrftoken', value: '123abc' },
          { name: 'sessionid', value: '456def', params: ['Domain=example.com', 'Path=/'] },
          { name: 'username', value: 'smith', params: ['Expires=Wed, 21 Oct 2015 07:28:00 GMT', 'Secure', 'HttpOnly'] },
          { name: 'date' }
        ]
      };

      let plainResponse = [
        'HTTP/1.1 201 Created',
        'Connection: ',
        'Cache-Control: no-cache',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Set-Cookie: csrftoken=123abc',
        'Set-Cookie: sessionid=456def; Domain=example.com; Path=/',
        'Set-Cookie: username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly',
        'Set-Cookie: date=',
        ''
      ].join(HttpZConsts.eol);

      let builder = getBuilderInstance(responseModel);
      let actual = builder.build();
      should(actual).eql(plainResponse);
    });

    it('should build response message with body and contentType=text/plain', () => {
      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 200,
        statusMessage: 'Ok',
        headers: [
          {
            name: 'Connection',
            values: [
              { value: 'keep-alive' }
            ]
          },
          {
            name: 'Cache-Control',
            values: [
              { value: 'no-cache' }
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
          text: 'Text data'
        }
      };

      let plainResponse = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        'Text data'
      ].join(HttpZConsts.eol);

      let builder = getBuilderInstance(responseModel);
      let actual = builder.build();
      should(actual).eql(plainResponse);
    });
  });
});
