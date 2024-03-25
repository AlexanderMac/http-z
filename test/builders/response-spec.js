const _ = require('lodash')
const sinon = require('sinon')
const should = require('should')
const nassert = require('n-assert')
const HttpZConsts = require('../../src/consts')
const HttpZError = require('../../src/error')
const ResponseBuilder = require('../../src/builders/response')

describe('builders / response', () => {
  function getBuilderInstance(exResponseModel) {
    let responseModel = _.extend(
      {
        protocolVersion: 'HTTP/1.1',
        statusCode: 200,
        statusMessage: 'Ok'
      },
      exResponseModel
    )
    return new ResponseBuilder(responseModel)
  }

  describe('static build', () => {
    beforeEach(() => {
      sinon.stub(ResponseBuilder.prototype, 'build')
    })

    afterEach(() => {
      ResponseBuilder.prototype.build.restore()
    })

    it('should create instance of ResponseBuilder and call instance.build', () => {
      let model = {}
      let expected = 'ok'

      ResponseBuilder.prototype.build.returns('ok')

      let actual = ResponseBuilder.build(model)
      nassert.assert(actual, expected)

      nassert.assertFn({ inst: ResponseBuilder.prototype, fnName: 'build', expectedArgs: '_without-args_' })
    })
  })

  describe('build', () => {
    it('should call related methods and return response message', () => {
      let builder = getBuilderInstance()
      sinon.stub(builder, '_generateStartRow').returns('startRow' + HttpZConsts.EOL)
      sinon.stub(builder, '_generateHeaderRows').returns('headerRows' + HttpZConsts.EOL)
      sinon.stub(builder, '_generateBodyRows').returns('bodyRows')

      let expected = ['startRow', 'headerRows', '', 'bodyRows'].join(HttpZConsts.EOL)
      let actual = builder.build()
      should(actual).eql(expected)

      nassert.assertFn({ inst: builder, fnName: '_generateStartRow', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: builder, fnName: '_generateHeaderRows', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: builder, fnName: '_generateBodyRows', expectedArgs: '_without-args_' })
    })
  })

  describe('_generateStartRow', () => {
    it('should throw error when protocolVersion is undefined', () => {
      let builder = getBuilderInstance({ protocolVersion: undefined })

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'protocolVersion is required'
      })
    })

    it('should throw error when statusCode is undefined', () => {
      let builder = getBuilderInstance({ statusCode: undefined })

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'statusCode is required'
      })
    })

    it('should throw error when statusMessage is undefined', () => {
      let builder = getBuilderInstance({ statusMessage: undefined })

      should(builder._generateStartRow.bind(builder)).throw(HttpZError, {
        message: 'statusMessage is required'
      })
    })

    it('should build startRow when all params are valid', () => {
      let builder = getBuilderInstance()

      let expected = 'HTTP/1.1 200 Ok' + HttpZConsts.EOL
      let actual = builder._generateStartRow()
      should(actual).eql(expected)
    })
  })

  describe('functional tests', () => {
    it('should build response without body (header names in lower case)', () => {
      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 201,
        statusMessage: 'Created',
        headers: [
          {
            name: 'connection',
            value: ''
          },
          {
            name: 'cache-Control',
            value: 'no-cache'
          },
          {
            name: 'Content-type',
            value: 'text/plain;charset=UTF-8'
          },
          {
            name: 'content-encoding',
            value: 'gzip, deflate'
          }
        ]
      }

      let rawResponse = [
        'HTTP/1.1 201 Created',
        'Connection: ',
        'Cache-Control: no-cache',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(responseModel)
      let actual = builder.build()
      should(actual).eql(rawResponse)
    })

    it('should build response with cookies, but without body', () => {
      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 201,
        statusMessage: 'Created',
        headers: [
          {
            name: 'Connection',
            value: ''
          },
          {
            name: 'Cache-Control',
            value: 'no-cache'
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
            name: 'Set-Cookie',
            value: 'csrftoken=123abc'
          },
          {
            name: 'Set-Cookie',
            value: 'sessionid=456def; Domain=example.com; Path=/'
          }
        ]
      }

      let rawResponse = [
        'HTTP/1.1 201 Created',
        'Connection: ',
        'Cache-Control: no-cache',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Set-Cookie: csrftoken=123abc',
        'Set-Cookie: sessionid=456def; Domain=example.com; Path=/',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(responseModel)
      let actual = builder.build()
      should(actual).eql(rawResponse)
    })

    it('should build response with body of contentType=text/plain', () => {
      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 200,
        statusMessage: 'Ok',
        headers: [
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
            name: 'Content-Type',
            value: 'text/plain;charset=UTF-8'
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

      let rawResponse = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Length: 301',
        '',
        'Text data'
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(responseModel)
      let actual = builder.build()
      should(actual).eql(rawResponse)
    })

    it('should build response with body of contentType=text/plain and transfer-encoding=chunked', () => {
      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 200,
        statusMessage: 'Ok',
        headers: [
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
            name: 'Content-Type',
            value: 'text/plain;charset=UTF-8'
          },
          {
            name: 'Transfer-Encoding',
            value: 'chunked'
          }
        ],
        body: {
          contentType: 'text/plain',
          text: 'The Transfer-Encoding header specifies the form of encoding used to safely transfer the payload body to the user'
        }
      }

      let rawResponse = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        'Content-Type: text/plain;charset=UTF-8',
        'Transfer-Encoding: chunked',
        '',
        '25',
        'The Transfer-Encoding hea',
        '25',
        'der specifies the form of',
        '25',
        ' encoding used to safely ',
        '25',
        'transfer the payload body',
        '12',
        ' to the user'
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance(responseModel)
      let actual = builder.build()
      should(actual).eql(rawResponse)
    })
  })
})
