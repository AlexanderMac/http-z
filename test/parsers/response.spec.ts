import { EOL, HttpProtocolVersion } from '../../src/constants'
import { HttpZError } from '../../src/error'
import { HttpZResponseParser } from '../../src/parsers/response'
import { HttpZParserResponseModel } from '../../src/parsers/types'
import { HttpZBody, HttpZCookieParam, HttpZHeader } from '../../src/types'

describe('parsers / response', () => {
  function getParserInstance(rawMessage = ''): HttpZResponseParser {
    return new HttpZResponseParser(rawMessage)
  }

  describe('static parse', () => {
    let _parseRequestSpy: jest.SpyInstance

    beforeAll(() => {
      _parseRequestSpy = jest.spyOn(HttpZResponseParser, 'parse')
    })

    afterEach(() => {
      _parseRequestSpy.mockReset()
    })

    afterAll(() => {
      _parseRequestSpy.mockRestore()
    })

    it('should create instance of HttpZResponseParser and call instance.parse', () => {
      const message = 'raw'
      const expected = 'ok'
      const expectedArgs = [message]

      _parseRequestSpy.mockReturnValue('ok')

      const actual = HttpZResponseParser.parse(message)
      expect(actual).toEqual(expected)

      expect(_parseRequestSpy).toHaveBeenCalledTimes(1)
      expect(_parseRequestSpy).toHaveBeenCalledWith(...expectedArgs)
    })
  })

  describe('parse', () => {
    it('should call related methods and return response message', () => {
      const parser = getParserInstance('rawRequest')
      parser['_parseMessageForRows'] = jest.fn(() => null)
      parser['_parseStartRow'] = jest.fn(() => null)
      parser['_parseHeaderRows'] = jest.fn(() => null)
      parser['_parseCookieRows'] = jest.fn(() => null)
      parser['_parseBodyRows'] = jest.fn(() => null)
      parser['_generateModel'] = jest.fn(() => 'responseModel' as any as HttpZParserResponseModel)

      const expected = 'responseModel'
      const actual = parser.parse()
      expect(actual).toEqual(expected)

      expect(parser['_parseMessageForRows']).toHaveBeenCalledTimes(1)
      expect(parser['_parseStartRow']).toHaveBeenCalledTimes(1)
      expect(parser['_parseHeaderRows']).toHaveBeenCalledTimes(1)
      expect(parser['_parseCookieRows']).toHaveBeenCalledTimes(1)
      expect(parser['_parseBodyRows']).toHaveBeenCalledTimes(1)
      expect(parser['_generateModel']).toHaveBeenCalledTimes(1)
    })
  })

  describe('_parseMessageForRows', () => {
    it('should parse message for rows when message is without Set-Cookie and Body rows', () => {
      const rawResponse = ['start-line', 'header1', 'header2', 'header3', '', ''].join(EOL)

      const parser = getParserInstance(rawResponse)
      parser['_parseMessageForRows']()

      expect(parser['startRow']).toEqual('start-line')
      expect(parser['headerRows']).toEqual(['header1', 'header2', 'header3'])
      expect(parser['cookieRows']).toEqual([])
      expect(parser['bodyRows']).toEqual('')
    })

    it('should parse message for rows when message contains Set-Cookie rows', () => {
      const rawResponse = ['start-line', 'header1', 'header2', 'header3', 'set-cookie', 'set-cookie', '', ''].join(EOL)

      const parser = getParserInstance(rawResponse)
      parser['_parseMessageForRows']()

      expect(parser['startRow']).toEqual('start-line')
      expect(parser['headerRows']).toEqual(['header1', 'header2', 'header3', 'set-cookie', 'set-cookie'])
      expect(parser['cookieRows']).toEqual(['set-cookie', 'set-cookie'])
      expect(parser['bodyRows']).toEqual('')
    })

    it('should parse message for rows when message contains Body rows', () => {
      const rawResponse = ['start-line', 'header1', 'header2', 'header3', '', 'body'].join(EOL)

      const parser = getParserInstance(rawResponse)
      parser['_parseMessageForRows']()

      expect(parser['startRow']).toEqual('start-line')
      expect(parser['headerRows']).toEqual(['header1', 'header2', 'header3'])
      expect(parser['cookieRows']).toEqual([])
      expect(parser['bodyRows']).toEqual('body')
    })
  })

  describe('_parseStartRow', () => {
    it('should throw error when startRow has invalid format', () => {
      const parser = getParserInstance()
      parser['startRow'] = 'Invalid response startRow'
      const err = new HttpZError(
        'Incorrect startRow format, expected: HTTP-Version status-code reason-phrase',
        'Invalid response startRow',
      )

      expect(parser['_parseStartRow'].bind(parser)).toThrow(err)
    })

    it('should set instance fields when startRow has valid format (reason is empty)', () => {
      const parser = getParserInstance()
      parser['startRow'] = 'HTTP/2 204 '

      parser['_parseStartRow']()
      expect(parser['protocolVersion']).toEqual('HTTP/2')
      expect(parser['statusCode']).toEqual(204)
      expect(parser['statusMessage']).toEqual('')
    })

    it('should set instance fields when startRow has valid format (reason is not empty)', () => {
      const parser = getParserInstance()
      parser['startRow'] = 'HTTP/3 500 Server Error'

      parser['_parseStartRow']()
      expect(parser['protocolVersion']).toEqual('HTTP/3')
      expect(parser['statusCode']).toEqual(500)
      expect(parser['statusMessage']).toEqual('Server Error')
    })
  })

  describe('_parseCookieRows', () => {
    function getDefaultCookies(): string[] {
      return [
        'Set-Cookie: csrftoken=123abc',
        'Set-Cookie: ',
        'Set-Cookie: sessionid=; Domain=example.com; Path=/',
        'Set-Cookie: username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly',
      ]
    }

    it('should throw error when some of cookieRows has invalid format (empty cookie name)', () => {
      const parser = getParserInstance()
      parser['cookieRows'] = getDefaultCookies()
      parser['cookieRows'][1] = 'Set-cookie:  =456def;  Domain=example.com;'
      const err = new HttpZError(
        'Incorrect set-cookie pair format, expected: Name1=Value1;...',
        '=456def;  Domain=example.com;',
      )

      expect(parser['_parseCookieRows'].bind(parser)).toThrow(err)
    })

    it('should set instance.cookies to undefined when cookieRows is an empty array', () => {
      const parser = getParserInstance()
      parser['cookieRows'] = []
      const expected = undefined

      parser['_parseCookieRows']()
      expect(parser['cookies']).toEqual(expected)
    })

    it('should set instance.cookies when cookieRows is valid and not an empty array', () => {
      const parser = getParserInstance()
      parser['cookieRows'] = getDefaultCookies()
      const expected = [
        { name: 'csrftoken', value: '123abc' },
        {},
        { name: 'sessionid', params: ['Domain=example.com', 'Path=/'] },
        { name: 'username', value: 'smith', params: ['Expires=Wed, 21 Oct 2015 07:28:00 GMT', 'Secure', 'HttpOnly'] },
      ]

      parser['_parseCookieRows']()
      expect(parser['cookies']).toEqual(expected)
    })
  })

  describe('_generateModel', () => {
    it('should generate response model using instance fields when some fields are undefined', () => {
      const parser = getParserInstance()
      parser['headersSize'] = 25
      parser['bodySize'] = 0
      parser['protocolVersion'] = 'protocolVersion' as HttpProtocolVersion
      parser['statusCode'] = 'statusCode' as any as number
      parser['statusMessage'] = 'statusMessage'

      const expected = {
        protocolVersion: 'protocolVersion',
        statusCode: 'statusCode',
        statusMessage: 'statusMessage',
        headersSize: 25,
        bodySize: 0,
      }
      const actual = parser['_generateModel']()
      expect(actual).toEqual(expected)
    })

    it('should generate response model using instance fields', () => {
      const parser = getParserInstance()
      parser['headersSize'] = 55
      parser['bodySize'] = 4
      parser['protocolVersion'] = 'protocolVersion' as HttpProtocolVersion
      parser['statusCode'] = 'statusCode' as any as number
      parser['statusMessage'] = 'statusMessage'
      parser['headers'] = 'headers' as any as HttpZHeader[]
      parser['cookies'] = 'cookies' as any as HttpZCookieParam[]
      parser['body'] = 'body' as any as HttpZBody

      const expected = {
        protocolVersion: 'protocolVersion',
        statusCode: 'statusCode',
        statusMessage: 'statusMessage',
        headers: 'headers',
        cookies: 'cookies',
        body: 'body',
        headersSize: 55,
        bodySize: 4,
      }
      const actual = parser['_generateModel']()
      expect(actual).toEqual(expected)
    })
  })

  describe('functional tests', () => {
    it('should parse response without headers and body', () => {
      const rawResponse = ['HTTP/1.1 204 No content', '', ''].join(EOL)

      const responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 204,
        statusMessage: 'No content',
        headers: [],
        headersSize: 27,
        bodySize: 0,
      }

      const parser = getParserInstance(rawResponse)
      const actual = parser.parse()
      expect(actual).toEqual(responseModel)
    })

    it('should parse response without body (header names in lower case)', () => {
      const rawResponse = [
        'HTTP/1.1 201 Created',
        'connection: ',
        'cache-Control: no-cache',
        'Content-type: text/plain; charset=UTF-8',
        'content-encoding: gzip,deflate',
        '',
        '',
      ].join(EOL)

      const responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 201,
        statusMessage: 'Created',
        headers: [
          {
            name: 'Connection',
            value: '',
          },
          {
            name: 'Cache-Control',
            value: 'no-cache',
          },
          {
            name: 'Content-Type',
            value: 'text/plain; charset=UTF-8',
          },
          {
            name: 'Content-Encoding',
            value: 'gzip,deflate',
          },
        ],
        headersSize: 136,
        bodySize: 0,
      }

      const parser = getParserInstance(rawResponse)
      const actual = parser.parse()
      expect(actual).toEqual(responseModel)
    })

    it('should parse response without cookies and body', () => {
      const rawResponse = [
        'HTTP/1.1 201 Created',
        'Connection: ',
        'Cache-Control: no-cache',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Set-Cookie: csrftoken=123abc',
        'Set-Cookie: sessionid=456def; Domain=example.com; Path=/',
        'Set-Cookie: username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly',
        '',
        '',
      ].join(EOL)

      const responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 201,
        statusMessage: 'Created',
        headers: [
          {
            name: 'Connection',
            value: '',
          },
          {
            name: 'Cache-Control',
            value: 'no-cache',
          },
          {
            name: 'Content-Type',
            value: 'text/plain; charset=UTF-8',
          },
          {
            name: 'Content-Encoding',
            value: 'gzip,deflate',
          },
          {
            name: 'Set-Cookie',
            value: 'csrftoken=123abc',
          },
          {
            name: 'Set-Cookie',
            value: 'sessionid=456def; Domain=example.com; Path=/',
          },
          {
            name: 'Set-Cookie',
            value: 'username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly',
          },
        ],
        cookies: [
          { name: 'csrftoken', value: '123abc' },
          { name: 'sessionid', value: '456def', params: ['Domain=example.com', 'Path=/'] },
          { name: 'username', value: 'smith', params: ['Expires=Wed, 21 Oct 2015 07:28:00 GMT', 'Secure', 'HttpOnly'] },
        ],
        headersSize: 309,
        bodySize: 0,
      }

      const parser = getParserInstance(rawResponse)
      const actual = parser.parse()
      expect(actual).toEqual(responseModel)
    })

    it('should parse response with body of contentType=text/plain', () => {
      const rawResponse = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Content-Length: 301',
        '',
        'Text data',
      ].join(EOL)

      const responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 200,
        statusMessage: 'Ok',
        headers: [
          {
            name: 'Connection',
            value: 'keep-alive',
          },
          {
            name: 'Cache-Control',
            value: 'no-cache',
          },
          {
            name: 'Content-Type',
            value: 'text/plain; charset=UTF-8',
          },
          {
            name: 'Content-Encoding',
            value: 'gzip,deflate',
          },
          {
            name: 'Content-Length',
            value: '301',
          },
        ],
        body: {
          contentType: 'text/plain',
          text: 'Text data',
        },
        headersSize: 162,
        bodySize: 9,
      }

      const parser = getParserInstance(rawResponse)
      const actual = parser.parse()
      expect(actual).toEqual(responseModel)
    })

    it('should parse response with body of contentType=text/plain and transfer-encoding=chunked', () => {
      const rawResponse = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Encoding: gzip,deflate',
        'Transfer-Encoding: chunked',
        '',
        '19',
        'The Transfer-Encoding hea',
        '19',
        'der specifies the form of',
        '19',
        ' encoding used to safely ',
        '19',
        'transfer the payload body',
        'C',
        ' to the user',
      ].join(EOL)

      const responseModel = {
        protocolVersion: 'HTTP/1.1',
        statusCode: 200,
        statusMessage: 'Ok',
        headers: [
          {
            name: 'Connection',
            value: 'keep-alive',
          },
          {
            name: 'Cache-Control',
            value: 'no-cache',
          },
          {
            name: 'Content-Type',
            value: 'text/plain; charset=UTF-8',
          },
          {
            name: 'Content-Encoding',
            value: 'gzip,deflate',
          },
          {
            name: 'Transfer-Encoding',
            value: 'chunked',
          },
        ],
        body: {
          contentType: 'text/plain',
          text: 'The Transfer-Encoding header specifies the form of encoding used to safely transfer the payload body to the user',
        },
        headersSize: 169,
        bodySize: 139,
      }

      const parser = getParserInstance(rawResponse)
      const actual = parser.parse()
      expect(actual).toEqual(responseModel)
    })
  })
})
