const _ = require('lodash')
const sinon = require('sinon')
const should = require('should')
const nassert = require('n-assert')
const HttpZConsts = require('../../src/consts')
const HttpZError = require('../../src/error')
const RequestParser = require('../../src/parsers/request')

describe('parsers / request', () => {
  function getParserInstance(...params) {
    return new RequestParser(...params)
  }

  describe('static parse', () => {
    beforeEach(() => {
      sinon.stub(RequestParser.prototype, 'parse')
    })

    afterEach(() => {
      RequestParser.prototype.parse.restore()
    })

    it('should create an instance of RequestParser and call instance.parse', () => {
      let params = 'plain'
      let expected = 'ok'

      RequestParser.prototype.parse.returns('ok')

      let actual = RequestParser.parse(params)
      nassert.assert(actual, expected)

      nassert.assertFn({ inst: RequestParser.prototype, fnName: 'parse', expectedArgs: '_without-args_' })
    })
  })

  describe('parse', () => {
    it('should call related methods and return request model', () => {
      let parser = getParserInstance('plainRequest', 'EOL')
      sinon.stub(parser, '_parseMessageForRows')
      sinon.stub(parser, '_parseHostRow')
      sinon.stub(parser, '_parseStartRow')
      sinon.stub(parser, '_parseHeaderRows')
      sinon.stub(parser, '_parseCookiesRow')
      sinon.stub(parser, '_parseBodyRows')
      sinon.stub(parser, '_generateModel').returns('requestModel')

      let expected = 'requestModel'
      let actual = parser.parse()
      should(actual).eql(expected)

      nassert.assertFn({ inst: parser, fnName: '_parseMessageForRows', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_parseHostRow', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_parseStartRow', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_parseHeaderRows', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_parseCookiesRow', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_parseBodyRows', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_generateModel', expectedArgs: '_without-args_' })
    })
  })

  describe('_parseMessageForRows', () => {
    it('should parse message for rows when message is without Cookie and Body rows', () => {
      let plainRequest = [
        'start-line',
        'host: somehost',
        'header1',
        'header2',
        'header3',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let parser = getParserInstance(plainRequest)
      parser._parseMessageForRows()

      should(parser.startRow).eql('start-line')
      should(parser.hostRow).eql('host: somehost')
      should(parser.headerRows).eql(['header1', 'header2', 'header3'])
      should(parser.cookiesRow).eql(undefined)
      should(parser.bodyRows).eql('')
    })

    it('should parse message for rows when message contains Cookies row', () => {
      let plainRequest = [
        'start-line',
        'host: somehost',
        'header1',
        'header2',
        'header3',
        'cookie: somecookies',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let parser = getParserInstance(plainRequest)
      parser._parseMessageForRows()

      should(parser.startRow).eql('start-line')
      should(parser.hostRow).eql('host: somehost')
      should(parser.headerRows).eql(['header1', 'header2', 'header3'])
      should(parser.cookiesRow).eql('cookie: somecookies')
      should(parser.bodyRows).eql('')
    })

    it('should parse message for rows when message contains Body rows', () => {
      let plainRequest = [
        'start-line',
        'host: somehost',
        'header1',
        'header2',
        'header3',
        '',
        'body'
      ].join(HttpZConsts.EOL)

      let parser = getParserInstance(plainRequest)
      parser._parseMessageForRows()

      should(parser.startRow).eql('start-line')
      should(parser.hostRow).eql('host: somehost')
      should(parser.headerRows).eql(['header1', 'header2', 'header3'])
      should(parser.cookiesRow).eql(undefined)
      should(parser.bodyRows).eql('body')
    })
  })

  describe('_parseHostRow', () => {
    it('should throw error when hostRow is nil', () => {
      const ERR = {
        message: 'host header is required'
      }
      let parser = getParserInstance()

      parser.hostRow = undefined
      should(parser._parseHostRow.bind(parser)).throw(HttpZError, ERR)
      parser.hostRow = null
      should(parser._parseHostRow.bind(parser)).throw(HttpZError, ERR)
    })

    it('should throw error when hostRow is empty string', () => {
      let parser = getParserInstance()
      parser.hostRow = ''

      should(parser._parseHostRow.bind(parser)).throw(HttpZError, {
        message: 'host header must be not empty string'
      })
    })

    it('should throw error when host header value is nil', () => {
      let parser = getParserInstance()
      parser.hostRow = 'Host  '

      should(parser._parseHostRow.bind(parser)).throw(HttpZError, {
        message: 'host header value is required'
      })
    })

    it('should throw error when host header value is empty string', () => {
      let parser = getParserInstance()
      parser.hostRow = 'Host:  '

      should(parser._parseHostRow.bind(parser)).throw(HttpZError, {
        message: 'host header value must be not empty string'
      })
    })

    it('should throw error when host header value is not valid URL', () => {
      let parser = getParserInstance()
      parser.hostRow = 'Host: ?!invalid-host'

      should(parser._parseHostRow.bind(parser)).throw(HttpZError, {
        message: 'Invalid host',
        details: '?!invalid-host'
      })
    })

    it('should set instance.host when host header value is defined and is valid URL', () => {
      let parser = getParserInstance()
      parser.hostRow = 'Host: www.example.com:2345'
      let expected = 'www.example.com:2345'

      parser._parseHostRow()
      should(parser.host).eql(expected)
    })
  })

  describe('_parseStartRow', () => {
    function test({ startRow, expected }) {
      let parser = getParserInstance()
      parser.startRow = startRow
      parser.host = 'example.com'

      parser._parseStartRow()
      should(parser.method).eql(expected.method)
      should(parser.protocol).eql(expected.protocol)
      should(parser.protocolVersion).eql(expected.protocolVersion)
      should(parser.path).eql(expected.path)
      should(parser.params).eql(expected.params)
    }

    function getDefaultExpected(ex) {
      let def = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        path: '/features',
        host: 'example.com',
        queryParams: []
      }
      return _.extend(def, ex)
    }

    it('should throw error when startRow has invalid format', () => {
      let parser = getParserInstance()
      parser.startRow = 'Invalid request startRow'

      should(parser._parseStartRow.bind(parser)).throw(HttpZError, {
        message: 'Incorrect startRow format, expected: Method request-target HTTP-Version',
        details: 'Invalid request startRow'
      })
    })

    it('should parse valid startRow (GET method)', () => {
      let startRow = 'GET /features HTTP/1.1'
      let expected = getDefaultExpected()

      test({ startRow, expected })
    })

    it('should parse valid startRow (DELETE method)', () => {
      let startRow = 'DELETE /features HTTP/1.1'
      let expected = getDefaultExpected({
        method: 'DELETE'
      })

      test({ startRow, expected })
    })

    it('should parse valid startRow (path is empty)', () => {
      let startRow = 'GET / HTTP/1.1'
      let expected = getDefaultExpected({
        path: '/'
      })

      test({ startRow, expected })
    })

    it('should parse valid startRow (path with two parameters)', () => {
      let startRow = 'GET /features?p1=v1&p2=v2 HTTP/1.1'
      let expected = getDefaultExpected({
        queryParams: [
          { name: 'p1', value: 'v1' },
          { name: 'p2', value: 'v2' }
        ]
      })

      test({ startRow, expected })
    })

    it('should parse valid startRow (HTTP protocol v2.0)', () => {
      let startRow = 'GET /features HTTP/2.0'
      let expected = getDefaultExpected({
        protocolVersion: 'HTTP/2.0'
      })

      test({ startRow, expected })
    })
  })

  describe('_parseCookiesRow', () => {
    it('should throw error when cookiesRow has invalid format', () => {
      let parser = getParserInstance()
      parser.cookiesRow = 'Cookie values'

      should(parser._parseCookiesRow.bind(parser)).throw(HttpZError, {
        message: 'Incorrect cookie row format, expected: Cookie: Name1=Value1;...',
        details: 'Cookie values'
      })
    })

    it('should throw error when cookie values have invalid format', () => {
      let parser = getParserInstance()
      parser.cookiesRow = 'Cookie: csrftoken=123abc;=val'

      should(parser._parseCookiesRow.bind(parser)).throw(HttpZError, {
        message: 'Incorrect cookie pair format, expected: Name1=Value1;...',
        details: 'csrftoken=123abc;=val'
      })
    })

    it('should set instance.cookies to undefined when cookiesRow is undefined', () => {
      let parser = getParserInstance()
      parser.cookiesRow = undefined
      let expected

      parser._parseCookiesRow()
      should(parser.cookies).eql(expected)
    })

    it('should set instance.cookies to [] when cookiesRow does not contain values', () => {
      let parser = getParserInstance()
      parser.cookiesRow = 'Cookie:'
      let expected = []

      parser._parseCookiesRow()
      should(parser.cookies).eql(expected)
    })

    it('should set instance.cookies when cookiesRow is valid and not empty', () => {
      let parser = getParserInstance()
      parser.cookiesRow = 'Cookie: csrftoken=123abc;sessionid=456def;username='
      let expected = [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '456def' },
        { name: 'username' }
      ]

      parser._parseCookiesRow()
      should(parser.cookies).eql(expected)
    })
  })

  describe('_generateModel', () => {
    it('should generate request model using instance fields when some fields are undefined', () => {
      let parser = getParserInstance()
      parser.headersSize = 25
      parser.bodySize = 0
      parser.method = 'method'
      parser.protocol = 'protocol'
      parser.protocolVersion = 'protocolVersion'
      parser.path = 'path'
      parser.host = 'host'

      let expected = {
        method: 'method',
        protocol: 'protocol',
        protocolVersion: 'protocolVersion',
        path: 'path',
        host: 'host',
        headersSize: 25,
        bodySize: 0
      }
      let actual = parser._generateModel()
      should(actual).eql(expected)
    })

    it('should generate request model using instance fields', () => {
      let parser = getParserInstance()
      parser.headersSize = 55
      parser.bodySize = 4
      parser.method = 'method'
      parser.protocol = 'protocol'
      parser.protocolVersion = 'protocolVersion'
      parser.path = 'path'
      parser.host = 'host'
      parser.queryParams = 'queryParams'
      parser.headers = 'headers'
      parser.cookies = 'cookies'
      parser.body = 'body'

      let expected = {
        method: 'method',
        protocol: 'protocol',
        protocolVersion: 'protocolVersion',
        path: 'path',
        host: 'host',
        queryParams: 'queryParams',
        headers: 'headers',
        cookies: 'cookies',
        body: 'body',
        headersSize: 55,
        bodySize: 4
      }
      let actual = parser._generateModel()
      should(actual).eql(expected)
    })
  })

  describe('functional tests', () => {
    it('should parse request without headers and body', () => {
      let plainRequest = [
        'GET /features?p1=v1&p2= HTTP/1.1',
        'host: www.example.com',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let requestModel = {
        method: 'GET',
        protocol: 'HTTP',
        protocolVersion: 'HTTP/1.1',
        host: 'www.example.com',
        path: '/features',
        queryParams: [
          { name: 'p1', value: 'v1' },
          { name: 'p2', value: '' }
        ],
        headers: [],
        headersSize: 59,
        bodySize: 0
      }

      let parser = getParserInstance(plainRequest)
      let actual = parser.parse()
      should(actual).eql(requestModel)
    })

    it('should parse request without body (header names in lower case)', () => {
      let plainRequest = [
        'GET /features HTTP/1.1',
        'host: example.com',
        'connection: ',
        'accept: */*',
        'accept-Encoding: gzip,deflate',
        'accept-language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0',
        'generated-by: "modern-framework 2020"',
        '',
        ''
      ].join(HttpZConsts.EOL)

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
          },
          {
            name: 'User-Agent',
            values: [
              { value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0' }
            ]
          },
          {
            name: 'Generated-By',
            values: [
              { value: 'modern-framework 2020' }
            ]
          }
        ],
        headersSize: 288,
        bodySize: 0
      }

      let parser = getParserInstance(plainRequest)
      let actual = parser.parse()
      should(actual).eql(requestModel)
    })

    it('should parse request with cookies and without body', () => {
      let plainRequest = [
        'GET /features HTTP/1.1',
        'Host: example.com',
        'Connection: ',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Cookie: csrftoken=123abc;sessionid=sd=456def;userid=',
        '',
        ''
      ].join(HttpZConsts.EOL)

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
          { name: 'sessionid', value: 'sd=456def' },
          { name: 'userid' }
        ],
        headersSize: 211,
        bodySize: 0
      }

      let parser = getParserInstance(plainRequest)
      let actual = parser.parse()
      should(actual).eql(requestModel)
    })

    it('should parse request with body of contentType=text/plain', () => {
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
        'Text data'
      ].join(HttpZConsts.EOL)

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
          text: 'Text data'
        },
        headersSize: 262,
        bodySize: 9
      }

      let parser = getParserInstance(plainRequest)
      let actual = parser.parse()
      should(actual).eql(requestModel)
    })

    it('should parse request with body of contentType=application/x-www-form-urlencoded', () => {
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
        'firstName=John&lastName=&age=25'
      ].join(HttpZConsts.EOL)

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
          params: [
            { name: 'firstName', value: 'John' },
            { name: 'lastName', value: '' },
            { name: 'age', value: '25' }
          ]
        },
        headersSize: 285,
        bodySize: 31
      }

      let parser = getParserInstance(plainRequest)
      let actual = parser.parse()
      should(actual).eql(requestModel)
    })

    it('should parse request with body of contentType=multipart/form-data', () => {
      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: multipart/form-data; boundary="111362:53119209"',
        'Content-Encoding: gzip,deflate',
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
              { value: 'multipart/form-data', params: 'boundary="111362:53119209"' }
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
        },
        headersSize: 284,
        bodySize: 367
      }

      let parser = getParserInstance(plainRequest)
      let actual = parser.parse()
      should(actual).eql(requestModel)
    })

    it('should parse request with body of contentType=multipart/alternative (inline)', () => {
      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: multipart/alternative; boundary="111362-53119209"',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        '--111362-53119209',
        'Content-Disposition: inline',
        '',
        '<base64-data>',
        '--111362-53119209--'
      ].join(HttpZConsts.EOL)

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
              { value: 'multipart/alternative', params: 'boundary="111362-53119209"' }
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
          contentType: 'multipart/alternative',
          boundary: '111362-53119209',
          params: [
            {
              type: 'inline',
              value: '<base64-data>'
            }
          ]
        },
        headersSize: 286,
        bodySize: 84
      }

      let parser = getParserInstance(plainRequest)
      let actual = parser.parse()
      should(actual).eql(requestModel)
    })

    it('should parse request with body of contentType=multipart/mixed (attachment)', () => {
      let plainRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip,deflate',
        'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type: multipart/mixed; boundary="11136253119209"',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        '--11136253119209',
        'Content-Disposition: attachment; filename="photo1.jpg"',
        'Content-Type: application/octet-stream',
        '',
        '<binary-data>',
        '--11136253119209--'
      ].join(HttpZConsts.EOL)

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
              { value: 'multipart/mixed', params: 'boundary="11136253119209"' }
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
        headersSize: 279,
        bodySize: 149
      }

      let parser = getParserInstance(plainRequest)
      let actual = parser.parse()
      should(actual).eql(requestModel)
    })
  })
})
