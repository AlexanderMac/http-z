const _ = require('lodash')
const sinon = require('sinon')
const should = require('should')
const nassert = require('n-assert')
const HttpZConsts = require('../../src/consts')
const HttpZError = require('../../src/error')
const BaseBuilder = require('../../src/builders/base')
const RequestBuilder = require('../../src/builders/request')

describe('builders / request', () => {
  function getBuilderInstance(exRequestModel) {
    let requestModel = _.extend({
      method: 'get',
      protocolVersion: 'http/1.1',
      target: '/',
      host: 'example.com',
      path: '/'
    }, exRequestModel)
    return new RequestBuilder(requestModel)
  }

  describe('static build', () => {
    beforeEach(() => {
      sinon.stub(RequestBuilder.prototype, 'build')
    })

    afterEach(() => {
      RequestBuilder.prototype.build.restore()
    })

    it('should create instance of RequestBuilder and call instance.build', () => {
      let model = {}
      let expected = 'ok'

      RequestBuilder.prototype.build.returns('ok')

      let actual = RequestBuilder.build(model)
      nassert.assert(actual, expected)

      nassert.assertFn({ inst: RequestBuilder.prototype, fnName: 'build', expectedArgs: '_without-args_' })
    })
  })

  describe('build', () => {
    it('should call related methods and return request message', () => {
      let builder = getBuilderInstance()
      sinon.stub(builder, '_generateStartRow').returns('startRow' + HttpZConsts.EOL)
      sinon.stub(builder, '_generateHeaderRows').returns('headerRows' + HttpZConsts.EOL)
      sinon.stub(builder, '_generateCookiesRow').returns('cookieRow' + HttpZConsts.EOL)
      sinon.stub(builder, '_generateBodyRows').returns('bodyRows')

      let expected = [
        'startRow',
        'headerRows',
        'cookieRow',
        '',
        'bodyRows'
      ].join(HttpZConsts.EOL)
      let actual = builder.build()
      should(actual).eql(expected)

      nassert.assertFn({ inst: builder, fnName: '_generateStartRow', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: builder, fnName: '_generateHeaderRows', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: builder, fnName: '_generateCookiesRow', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: builder, fnName: '_generateBodyRows', expectedArgs: '_without-args_' })
    })
  })

  describe('_generateStartRow', () => {
    it('should throw error when method is undefined', () => {
      let builder = getBuilderInstance({ method: undefined })

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'method is required'
      })
    })

    it('should throw error when protocolVersion is undefined', () => {
      let builder = getBuilderInstance({ protocolVersion: undefined })

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'protocolVersion is required'
      })
    })

    it('should throw error when target is undefined', () => {
      let builder = getBuilderInstance({ target: undefined })

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'target is required'
      })
    })
  })

  describe('_generateHeaderRows', () => {
    beforeEach(() => {
      sinon.stub(BaseBuilder.prototype, '_generateHeaderRows')
    })

    afterEach(() => {
      BaseBuilder.prototype._generateHeaderRows.restore()
    })

    it('should throw error when instance.headers is not array', () => {
      let builder = new RequestBuilder({ headers: 'incorrect headers' })

      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, {
        message: 'headers must be an array'
      })

      nassert.assertFn({ inst: BaseBuilder.prototype, fnName: '_generateHeaderRows' })
    })

    it('should remove cookie headers and call parent method', () => {
      let builder = new RequestBuilder({
        headers: [
          {
            name: 'host',
            value: 'some host'
          },
          {
            name: 'cookie',
            value: 'some cookie1'
          },
          {
            name: 'connection',
            value: ''
          },
          {
            name: 'accept',
            value: '*/*'
          },
          {
            name: 'cookie',
            value: 'some cookie2'
          }
        ]
      })
      let expected = 'ok'
      let expectedHeaders = [
        {
          name: 'host',
          value: 'some host'
        },
        {
          name: 'connection',
          value: ''
        },
        {
          name: 'accept',
          value: '*/*'
        }
      ]

      BaseBuilder.prototype._generateHeaderRows.returns('ok')

      let actual = builder._generateHeaderRows()
      should(actual).eql(expected)
      should(builder.headers).eql(expectedHeaders)

      nassert.assertFn({ inst: BaseBuilder.prototype, fnName: '_generateHeaderRows', expectedArgs: '_without-args_' })
    })
  })

  describe('_generateCookiesRow', () => {
    it('should return empty string when instance.cookies is undefined', () => {
      let builder = getBuilderInstance({ cookies: undefined })

      let expected = ''
      let actual = builder._generateCookiesRow()
      should(actual).eql(expected)
    })

    it('should throw error when instance.cookies is not array', () => {
      let builder = getBuilderInstance({ cookies: 'incorrect cookies' })

      should(builder._generateCookiesRow.bind(builder)).throw(HttpZError, {
        message: 'cookies must be an array'
      })
    })

    it('should throw error when instance.cookies contains element with undefined name', () => {
      let builder = getBuilderInstance({
        cookies: [
          { name: 'c1', value: 'v1' },
          { value: 'v2' }
        ]
      })

      should(builder._generateCookiesRow.bind(builder)).throw(HttpZError, {
        message: 'cookie name is required',
        details: 'cookie index: 1'
      })
    })

    it('should build cookies row when all params are valid', () => {
      let builder = getBuilderInstance({
        cookies: [
          { name: 'c1', value: 'v1' },
          { name: 'c2', value: 'v2' },
          { name: 'c3' }
        ]
      })

      let expected = 'Cookie: c1=v1; c2=v2; c3=' + HttpZConsts.EOL
      let actual = builder._generateCookiesRow()
      should(actual).eql(expected)
    })
  })

  describe('functional tests', () => {
    it('should build request without headers and body', () => {
      let requestModel = {
        method: 'GET',
        protocolVersion: 'HTTP/1.1',
        target: '/features?p1=v1%3B&p2=',
        queryParams: [
          { name: 'p1', value: 'v1;' },
          { name: 'p2' }
        ],
        headers: [
          { name: 'Host', value: 'example.com' }
        ]
      }

      let rawRequest = [
        'GET /features?p1=v1%3B&p2= HTTP/1.1',
        'Host: example.com',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(requestModel)
      let actual = builder.build()
      should(actual).eql(rawRequest)
    })

    it('should build request without body (header names in lower case)', () => {
      let requestModel = {
        method: 'get',
        protocolVersion: 'http/1.1',
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com'
          },
          {
            name: 'connection',
            value: ''
          },
          {
            name: 'accept',
            value: '*/*'
          },
          {
            name: 'cache-Control',
            value: 'no-cache'
          },
          {
            name: 'content-encoding',
            value: 'gzip, deflate'
          }
        ]
      }

      let rawRequest = [
        'GET /features HTTP/1.1',
        'Host: example.com',
        'Connection: ',
        'Accept: */*',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(requestModel)
      let actual = builder.build()
      should(actual).eql(rawRequest)
    })

    it('should build request with cookies, but without body', () => {
      let requestModel = {
        method: 'GET',
        protocolVersion: 'HTTP/1.1',
        target: 'https://www.example.com/features',
        headers: [
          {
            name: 'Host',
            value: 'www.example.com'
          },
          {
            name: 'Connection',
            value: ''
          },
          {
            name: 'Accept',
            value: '*/*'
          },
          {
            name: 'Accept-Encoding',
            value: 'gzip, deflate'
          },
          {
            name: 'Accept-Language',
            value: 'ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4'
          },
          // it will be dropped
          {
            name: 'Cookie',
            value: 'firstName=John; lastName=Smith'
          }
        ],
        cookies: [
          { name: 'csrftoken', value: '123abc' },
          { name: 'sessionid', value: '456def%3B' },
          { name: 'username' }
        ]
      }

      let rawRequest = [
        'GET https://www.example.com/features HTTP/1.1',
        'Host: www.example.com',
        'Connection: ',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Cookie: csrftoken=123abc; sessionid=456def%3B; username=',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(requestModel)
      let actual = builder.build()
      should(actual).eql(rawRequest)
    })

    it('should build request with body of contentType=text/plain', () => {
      let requestModel = {
        method: 'POST',
        protocolVersion: 'HTTP/1.1',
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com'
          },
          {
            name: 'Connection',
            value: 'keep-alive'
          },
          {
            name: 'Accept',
            value: '*/*'
          },
          {
            name: 'Accept-Encoding',
            value: 'gzip, deflate'
          },
          {
            name: 'Accept-Language',
            value: 'ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4'
          },
          {
            name: 'Content-Type',
            value: 'text/plain;charset=UTF-8'
          },
          {
            name: 'Content-Encoding',
            value: 'gzip, deflate'
          },
          {
            name: 'Content-Length',
            value: '301'
          }
        ],
        body: {
          contentType: 'text/plain',
          text: 'Text data'
        }
      }

      let rawRequest = [
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
        'Text data'
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(requestModel)
      let actual = builder.build()
      should(actual).eql(rawRequest)
    })

    it('should build request with body of contentType=application/x-www-form-urlencoded', () => {
      let requestModel = {
        method: 'POST',
        protocolVersion: 'HTTP/1.1',
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com'
          },
          {
            name: 'Connection',
            value: 'keep-alive'
          },
          {
            name: 'Accept',
            value: '*/*'
          },
          {
            name: 'Accept-Encoding',
            value: 'gzip, deflate'
          },
          {
            name: 'Accept-Language',
            value: 'ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4'
          },
          {
            name: 'Content-Type',
            value: 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          {
            name: 'Content-Encoding',
            value: 'gzip, deflate'
          },
          {
            name: 'Content-Length',
            value: '301'
          }
        ],
        body: {
          contentType: 'application/x-www-form-urlencoded',
          params: [
            { name: 'firstName', value: 'John' },
            { name: 'lastName' },
            { name: 'age', value: '25;' }
          ]
        }
      }

      let rawRequest = [
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
        'firstName=John&lastName=&age=25%3B'
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(requestModel)
      let actual = builder.build()
      should(actual).eql(rawRequest)
    })

    it('should build request with body of contentType=multipart/form-data', () => {
      let requestModel = {
        method: 'POST',
        protocolVersion: 'HTTP/1.1',
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com'
          },
          {
            name: 'Connection',
            value: 'keep-alive'
          },
          {
            name: 'Accept',
            value: '*/*'
          },
          {
            name: 'Accept-Encoding',
            value: 'gzip, deflate'
          },
          {
            name: 'Accept-Language',
            value: 'ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4'
          },
          {
            name: 'Content-Type',
            value: 'multipart/form-data;boundary="111362:53119209"'
          },
          {
            name: 'Content-Encoding',
            value: 'gzip, deflate'
          },
          {
            name: 'Content-Length',
            value: '301'
          }
        ],
        body: {
          contentType: 'multipart/form-data',
          boundary: '111362:53119209',
          params: [
            { name: 'user.data[firstName]', value: 'John' },
            {
              contentType: 'application/octet-stream',
              name: 'photo',
              fileName: 'photo1.jpg',
              value: '<binary-data>'
            },
            {
              contentType: 'text/plain',
              name: 'bio',
              value: 'some info\r\nmore info\r\n'
            }
          ]
        }
      }

      let rawRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: multipart/form-data;boundary="111362:53119209"',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        '--111362:53119209',
        'Content-Disposition: form-data; name="user.data[firstName]"',
        '',
        'John',
        '--111362:53119209',
        'Content-Disposition: form-data; name="photo"; filename="photo1.jpg"',
        'Content-Type: application/octet-stream',
        '',
        '<binary-data>',
        '--111362:53119209',
        'Content-Disposition: form-data; name="bio"',
        'Content-Type: text/plain',
        '',
        'some info',
        'more info',
        '',
        '--111362:53119209--'
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(requestModel)
      let actual = builder.build()
      should(actual).eql(rawRequest)
    })


    it('should build request with body of contentType=multipart/alternative (inline)', () => {
      let requestModel = {
        method: 'POST',
        protocolVersion: 'HTTP/1.1',
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com'
          },
          {
            name: 'Connection',
            value: 'keep-alive'
          },
          {
            name: 'Cache-Control',
            value: 'no-cache'
          },
          {
            name: 'Content-Encoding',
            value: 'gzip, deflate'
          },
          {
            name: 'Content-Length',
            value: '301'
          },
          {
            name: 'Content-Type',
            value: 'multipart/alternative;boundary="111362-53119209"'
          }
        ],
        body: {
          contentType: 'multipart/alternative',
          boundary: '111362-53119209',
          params: [
            {
              type: 'inline',
              value: '<base64-data>'
            }
          ]
        },
        headersSize: 243,
        bodySize: 84
      }
      let rawRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        'Content-Type: multipart/alternative;boundary="111362-53119209"',
        '',
        '--111362-53119209',
        'Content-Disposition: inline',
        '',
        '<base64-data>',
        '--111362-53119209--'
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(requestModel)
      let actual = builder.build()
      should(actual).eql(rawRequest)
    })

    it('should build request with body of contentType=multipart/mixed (attachment)', () => {
      let requestModel = {
        method: 'POST',
        protocolVersion: 'HTTP/1.1',
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com'
          },
          {
            name: 'Connection',
            value: 'keep-alive'
          },
          {
            name: 'Cache-Control',
            value: 'no-cache'
          },
          {
            name: 'Content-Encoding',
            value: 'gzip, deflate'
          },
          {
            name: 'Content-Length',
            value: '301'
          },
          {
            name: 'Content-Type',
            value: 'multipart/mixed;boundary="11136253119209"'
          }
        ],
        body: {
          contentType: 'multipart/mixed',
          boundary: '11136253119209',
          params: [
            {
              type: 'attachment',
              contentType: 'application/octet-stream',
              fileName: 'photo1.jpg',
              value: '<binary-data>'
            }
          ]
        },
        headersSize: 236,
        bodySize: 149
      }
      let rawRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        'Content-Type: multipart/mixed;boundary="11136253119209"',
        '',
        '--11136253119209',
        'Content-Disposition: attachment; filename="photo1.jpg"',
        'Content-Type: application/octet-stream',
        '',
        '<binary-data>',
        '--11136253119209--'
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(requestModel)
      let actual = builder.build()
      should(actual).eql(rawRequest)
    })
  })
})
