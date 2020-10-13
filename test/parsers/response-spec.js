const sinon = require('sinon')
const should = require('should')
const nassert = require('n-assert')
const HttpZConsts = require('../../src/consts')
const HttpZError = require('../../src/error')
const ResponseParser = require('../../src/parsers/response')

describe('parsers / response', () => {
  function getParserInstance(...params) {
    return new ResponseParser(...params)
  }

  describe('static parse', () => {
    beforeEach(() => {
      sinon.stub(ResponseParser.prototype, 'parse')
    })

    afterEach(() => {
      ResponseParser.prototype.parse.restore()
    })

    it('should create an instance of ResponseParser and call instance.parse', () => {
      let params = 'plain'
      let expected = 'ok'

      ResponseParser.prototype.parse.returns('ok')

      let actual = ResponseParser.parse(params)
      nassert.assert(actual, expected)

      nassert.assertFn({ inst: ResponseParser.prototype, fnName: 'parse', expectedArgs: '_without-args_' })
    })
  })

  describe('parse', () => {
    it('should call related methods and return response model', () => {
      let parser = getParserInstance('plainResponse')
      sinon.stub(parser, '_parseMessageForRows')
      sinon.stub(parser, '_parseStartRow')
      sinon.stub(parser, '_parseHeaderRows')
      sinon.stub(parser, '_parseCookieRows')
      sinon.stub(parser, '_parseBodyRows')
      sinon.stub(parser, '_generateModel').returns('responseModel')

      let expected = 'responseModel'
      let actual = parser.parse()
      should(actual).eql(expected)

      nassert.assertFn({ inst: parser, fnName: '_parseMessageForRows', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_parseStartRow', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_parseHeaderRows', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_parseCookieRows', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_parseBodyRows', expectedArgs: '_without-args_' })
      nassert.assertFn({ inst: parser, fnName: '_generateModel', expectedArgs: '_without-args_' })
    })
  })

  describe('_parseMessageForRows', () => {
    it('should parse message for rows when message is without Set-Cookie and Body rows', () => {
      let plainResponse = [
        'start-line',
        'header1',
        'header2',
        'header3',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let parser = getParserInstance(plainResponse)
      parser._parseMessageForRows()

      should(parser.startRow).eql('start-line')
      should(parser.headerRows).eql(['header1', 'header2', 'header3'])
      should(parser.cookieRows).eql([])
      should(parser.bodyRows).eql('')
    })

    it('should parse message for rows when message contains Set-Cookie rows', () => {
      let plainResponse = [
        'start-line',
        'header1',
        'header2',
        'header3',
        'set-cookie',
        'set-cookie',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let parser = getParserInstance(plainResponse)
      parser._parseMessageForRows()

      should(parser.startRow).eql('start-line')
      should(parser.headerRows).eql(['header1', 'header2', 'header3'])
      should(parser.cookieRows).eql(['set-cookie', 'set-cookie'])
      should(parser.bodyRows).eql('')
    })

    it('should parse message for rows when message contains Body rows', () => {
      let plainResponse = [
        'start-line',
        'header1',
        'header2',
        'header3',
        '',
        'body'
      ].join(HttpZConsts.EOL)

      let parser = getParserInstance(plainResponse)
      parser._parseMessageForRows()

      should(parser.startRow).eql('start-line')
      should(parser.headerRows).eql(['header1', 'header2', 'header3'])
      should(parser.cookieRows).eql([])
      should(parser.bodyRows).eql('body')
    })
  })

  describe('_parseStartRow', () => {
    it('should throw error when startRow has invalid format', () => {
      let parser = getParserInstance()
      parser.startRow = 'Invalid response startRow'

      should(parser._parseStartRow.bind(parser)).throw(HttpZError, {
        message: 'Incorrect startRow format, expected: HTTP-Version status-code reason-phrase',
        details: 'Invalid response startRow'
      })
    })

    it('should set instance fields when startRow has valid format (reason is empty)', () => {
      let parser = getParserInstance()
      parser.startRow = 'HTTP/2 204 '

      parser._parseStartRow()
      should(parser.protocolVersion).eql('HTTP/2')
      should(parser.statusCode).eql(204)
      should(parser.statusMessage).eql('')
    })

    it('should set instance fields when startRow has valid format (reason is not empty)', () => {
      let parser = getParserInstance()
      parser.startRow = 'HTTP/1.1 201 Created'

      parser._parseStartRow()
      should(parser.protocolVersion).eql('HTTP/1.1')
      should(parser.statusCode).eql(201)
      should(parser.statusMessage).eql('Created')
    })
  })

  describe('_parseCookieRows', () => {
    function getDefaultCookies() {
      return [
        'Set-Cookie: csrftoken=123abc',
        'Set-Cookie: sessionid=; Domain=example.com; Path=/',
        'Set-Cookie: username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly'
      ]
    }

    it('should throw error when some of cookieRows has invalid format (empty values)', () => {
      let parser = getParserInstance()
      parser.cookieRows = getDefaultCookies()
      parser.cookieRows[1] = 'Set-cookie:    '

      should(parser._parseCookieRows.bind(parser)).throw(HttpZError, {
        message: 'Incorrect set-cookie row format, expected: Set-Cookie: Name1=Value1;...',
        details: 'Set-cookie:    '
      })
    })

    it('should throw error when some of cookieRows has invalid format (empty cookie name)', () => {
      let parser = getParserInstance()
      parser.cookieRows = getDefaultCookies()
      parser.cookieRows[1] = 'Set-cookie:  =456def;  Domain=example.com;'

      should(parser._parseCookieRows.bind(parser)).throw(HttpZError, {
        message: 'Incorrect set-cookie pair format, expected: Name1=Value1;...',
        details: '=456def;  Domain=example.com;'
      })
    })

    it('should set instance.cookies to undefined when cookieRows is an empty array', () => {
      let parser = getParserInstance()
      parser.cookieRows = []
      let expected

      parser._parseCookieRows()
      should(parser.cookies).eql(expected)
    })

    it('should set instance.cookies when cookieRows is valid and not an empty array', () => {
      let parser = getParserInstance()
      parser.cookieRows = getDefaultCookies()
      let expected = [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', params: ['Domain=example.com', 'Path=/'] },
        { name: 'username', value: 'smith', params: ['Expires=Wed, 21 Oct 2015 07:28:00 GMT', 'Secure', 'HttpOnly'] }
      ]

      parser._parseCookieRows()
      should(parser.cookies).eql(expected)
    })
  })

  describe('_generateModel', () => {
    it('should generate response model using instance fields when some fields are undefined', () => {
      let parser = getParserInstance()
      parser.headersSize = 25
      parser.bodySize = 0
      parser.protocolVersion = 'protocolVersion'
      parser.statusCode = 'statusCode'
      parser.statusMessage = 'statusMessage'

      let expected = {
        protocolVersion: 'protocolVersion',
        statusCode: 'statusCode',
        statusMessage: 'statusMessage',
        headersSize: 25,
        bodySize: 0
      }
      let actual = parser._generateModel()
      should(actual).eql(expected)
    })

    it('should generate response model using instance fields', () => {
      let parser = getParserInstance()
      parser.headersSize = 55
      parser.bodySize = 4
      parser.protocolVersion = 'protocolVersion'
      parser.statusCode = 'statusCode'
      parser.statusMessage = 'statusMessage'
      parser.headers = 'headers'
      parser.cookies = 'cookies'
      parser.body = 'body'

      let expected = {
        protocolVersion: 'protocolVersion',
        statusCode: 'statusCode',
        statusMessage: 'statusMessage',
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
      let plainResponse = [
        'HTTP/1.1 204 No content',
        '',
        ''
      ].join(HttpZConsts.EOL)

      let responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 204,
        statusMessage: 'No content',
        headers: [],
        headersSize: 27,
        bodySize: 0
      }

      let parser = getParserInstance(plainResponse)
      let actual = parser.parse()
      should(actual).eql(responseModel)
    })

    it('should parse response without body (header names in lower case)', () => {
      let plainResponse = [
        'HTTP/1.1 201 Created',
        'connection: ',
        'cache-Control: no-cache',
        'Content-type: text/plain; charset=UTF-8',
        'content-encoding: gzip,deflate',
        '',
        ''
      ].join(HttpZConsts.EOL)

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
        headersSize: 136,
        bodySize: 0
      }

      let parser = getParserInstance(plainResponse)
      let actual = parser.parse()
      should(actual).eql(responseModel)
    })

    it('should parse response without cookies and body', () => {
      let plainResponse = [
        'HTTP/1.1 201 Created',
        'Connection: ',
        'Cache-Control: no-cache',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Set-Cookie: csrftoken=123abc',
        'Set-Cookie: sessionid=456def; Domain=example.com; Path=/',
        'Set-Cookie: username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly',
        '',
        ''
      ].join(HttpZConsts.EOL)

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
          { name: 'username', value: 'smith', params: ['Expires=Wed, 21 Oct 2015 07:28:00 GMT', 'Secure', 'HttpOnly'] }
        ],
        headersSize: 309,
        bodySize: 0
      }

      let parser = getParserInstance(plainResponse)
      let actual = parser.parse()
      should(actual).eql(responseModel)
    })

    it('should parse response with body of contentType=text/plain', () => {
      let plainResponse = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        'Text data'
      ].join(HttpZConsts.EOL)

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
        },
        headersSize: 162,
        bodySize: 9
      }

      let parser = getParserInstance(plainResponse)
      let actual = parser.parse()
      should(actual).eql(responseModel)
    })
  })
})
