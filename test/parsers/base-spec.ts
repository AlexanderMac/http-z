import { EOL, EOL2X } from '../../src/constants'
import { HttpZError } from '../../src/error'
import { HttpZBaseParser } from '../../src/parsers/base'
import { HttpZHeader } from '../../src/types'
import { ExpectedSpiedFnArgs, testSpiedFn } from '../test-utils'

describe('parsers / base', () => {
  function getParserInstance(rawMessage: string = ''): HttpZBaseParser {
    return new HttpZBaseParser(rawMessage)
  }

  describe('_parseMessageForRows', () => {
    it('should throw error when message does not have start-line', () => {
      const rawRequest = ['', 'Body'].join(EOL)
      const parser = getParserInstance(rawRequest)
      const err = new HttpZError(
        'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]',
      )

      expect(parser['_parseMessageForRows'].bind(parser)).toThrow(err)
    })

    it('should throw error when message does not have empty line between headers and body', () => {
      const rawRequest = ['start-line', 'host-line', 'Header1'].join(EOL)
      const parser = getParserInstance(rawRequest)
      const err = new HttpZError(
        'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]',
      )

      expect(parser['_parseMessageForRows'].bind(parser)).toThrow(err)
    })

    it('should parse message for rows without body', () => {
      const rawRequest = ['start-line', 'host-line', 'Header1', 'Header2', 'Header3', 'Cookie', '', ''].join(EOL)
      const parser = getParserInstance(rawRequest)

      parser['_parseMessageForRows']()
      expect(parser['startRow']).toEqual('start-line')
      expect(parser['headerRows']).toEqual(['host-line', 'Header1', 'Header2', 'Header3', 'Cookie'])
      expect(parser['bodyRows']).toEqual('')
      expect(parser['headersSize']).toEqual(60)
      expect(parser['bodySize']).toEqual(0)
    })

    it('should parse message for rows with body', () => {
      const rawRequest = ['start-line', 'host-line', 'Header1', 'Header2', 'Header3', 'Cookie', '', 'Body'].join(EOL)
      const parser = getParserInstance(rawRequest)

      parser['_parseMessageForRows']()
      expect(parser['startRow']).toEqual('start-line')
      expect(parser['headerRows']).toEqual(['host-line', 'Header1', 'Header2', 'Header3', 'Cookie'])
      expect(parser['bodyRows']).toEqual('Body')
      expect(parser['headersSize']).toEqual(60)
      expect(parser['bodySize']).toEqual(4)
    })
  })

  describe('_parseHeaderRows', () => {
    it('should throw error when headerRows has invalid format', () => {
      const parser = getParserInstance()
      parser['headerRows'] = ['Header1: value', 'Header2 - value', 'Header3:    value   ']
      const err = new HttpZError('Incorrect header row format, expected: Name: Value', 'Header2 - value')

      expect(parser['_parseHeaderRows'].bind(parser)).toThrow(err)
    })

    it('should set instance.headers when headerRows is valid', () => {
      const parser = getParserInstance()
      parser['headerRows'] = [
        'Connection:',
        'Accept: */*, text/plain',
        'accept-Encoding: gzip, deflate   ',
        'Accept-language: ru-RU, ru; q=0.8,en-US;q=0.6,en;  q=0.4',
      ]
      parser['_parseHeaderRows']()

      const expected = [
        {
          name: 'Connection',
          value: '',
        },
        {
          name: 'Accept',
          value: '*/*, text/plain',
        },
        {
          name: 'Accept-Encoding',
          value: 'gzip, deflate',
        },
        {
          name: 'Accept-Language',
          value: 'ru-RU, ru; q=0.8,en-US;q=0.6,en;  q=0.4',
        },
      ]
      expect(parser['headers']).toEqual(expected)
    })
  })

  describe('_parseBodyRows', () => {
    type SpiedFn = '_processTransferEncodingChunked' | '_parseFormDataBody' | '_parseUrlencodedBody' | '_parseTextBody'

    function test(
      headers: HttpZHeader[],
      bodyRows: string,
      expected: unknown,
      expectedFnArgs?: ExpectedSpiedFnArgs<SpiedFn>,
    ): void {
      const parser = getParserInstance()
      parser['_processTransferEncodingChunked'] = jest.fn(() => {})
      parser['_parseFormDataBody'] = jest.fn(() => {
        parser['body']!.boundary = 'FormDataBoundary'
        parser['body']!.params = 'FormDataBody' as any
      })
      parser['_parseUrlencodedBody'] = jest.fn(() => {
        parser['body']!.params = 'BodyParams' as any
      })
      parser['_parseTextBody'] = jest.fn(() => {
        parser['body']!.text = 'TextBody'
      })
      parser['headers'] = headers
      parser['bodyRows'] = bodyRows

      parser['_parseBodyRows']()
      expect(parser['body']).toEqual(expected)

      testSpiedFn(parser['_processTransferEncodingChunked'], '_processTransferEncodingChunked', expectedFnArgs)
      testSpiedFn(parser['_parseFormDataBody'], '_parseFormDataBody', expectedFnArgs)
      testSpiedFn(parser['_parseUrlencodedBody'], '_parseUrlencodedBody', expectedFnArgs)
      testSpiedFn(parser['_parseTextBody'], '_parseTextBody', expectedFnArgs)
    }

    it('should set instance.body to undefined when bodyRows is empty', () => {
      const headers = [] as HttpZHeader[]
      const bodyRows = ''
      const expected = undefined

      test(headers, bodyRows, expected)
    })

    it('should set instance.body.params when bodyRows is defined and contentType header is multipart/form-data', () => {
      const headers = [{ name: 'Content-Type', value: 'multipart/form-data' }]
      const bodyRows = 'body'
      const expected = {
        contentType: 'multipart/form-data',
        boundary: 'FormDataBoundary',
        params: 'FormDataBody',
      }
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_parseFormDataBody', calledTimes: 1 }

      test(headers, bodyRows, expected, expectedFnArgs)
    })

    it('should set instance.body.params when bodyRows is defined and contentType header is application/x-www-form-urlencoded', () => {
      const headers = [{ name: 'Content-Type', value: 'application/x-www-form-urlencoded' }]
      const bodyRows = 'body'
      const expected = {
        contentType: 'application/x-www-form-urlencoded',
        params: 'BodyParams',
      }
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_parseUrlencodedBody', calledTimes: 1 }

      test(headers, bodyRows, expected, expectedFnArgs)
    })

    it('should set instance.body.text when bodyRows is defined and contentType header is text/plain', () => {
      const headers = [{ name: 'Content-Type', value: 'text/plain' }]
      const bodyRows = 'body'
      const expected = {
        contentType: 'text/plain',
        text: 'TextBody',
      }
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_parseTextBody', calledTimes: 1 }

      test(headers, bodyRows, expected, expectedFnArgs)
    })

    it('should set instance.body.text when bodyRows is defined and contentType header is missing', () => {
      const headers = [] as HttpZHeader[]
      const bodyRows = 'body'
      const expected = {
        text: 'TextBody',
      }
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_parseTextBody', calledTimes: 1 }

      test(headers, bodyRows, expected, expectedFnArgs)
    })
  })

  describe('_processTransferEncodingChunked', () => {
    function getDefaultBodyRows(): string {
      return ['19', 'This is a long string', '11', '19', '', ' with new lines and num', '4', 'bers'].join(EOL)
    }

    it("should don't change bodyRows when transfer-encoding is not chunked", () => {
      const parser = getParserInstance()
      parser['headers'] = []
      parser['bodyRows'] = getDefaultBodyRows()

      parser['_processTransferEncodingChunked']()

      const expected = parser['bodyRows']
      expect(parser['bodyRows']).toEqual(expected)
    })

    it('should change bodyRows when transfer-encoding is chunked', () => {
      const parser = getParserInstance()
      parser['headers'] = [
        {
          name: 'Transfer-Encoding',
          value: 'chunked',
        },
      ]
      parser['bodyRows'] = getDefaultBodyRows()

      parser['_processTransferEncodingChunked']()

      const expected = 'This is a long string\r\n11\r\n with new lines and numbers'
      expect(parser['bodyRows']).toEqual(expected)
    })

    it('should throw error when transfer-encoding is chunked but body has incorrect format', () => {
      const parser = getParserInstance()
      parser['headers'] = [
        {
          name: 'Transfer-Encoding',
          value: 'chunked',
        },
      ]
      parser['bodyRows'] = '5\r\nStart\r\n2\r\nEnd\r\n'
      const err = new HttpZError('Incorrect row, expected: NumberEOL', parser['bodyRows'])

      expect(parser['_processTransferEncodingChunked'].bind(parser)).toThrow(err)
    })
  })

  describe('_parseFormDataBody', () => {
    it('should throw error when bodyRows contains param with incorrect format', () => {
      const parser = getParserInstance()
      parser['body'] = {}
      parser['headers'] = [
        {
          name: 'Content-Type',
          value: 'multipart/form-data;boundary=11136253119209',
        },
      ]
      parser['bodyRows'] = [
        '--11136253119209',
        'Content-Disposition: form-data; name="firstName"',
        '',
        'John',
        '--11136253119209',
        'Content-Disposition: form-data; name="age"',
        '25',
        '--11136253119209--',
      ].join(EOL)
      const err = new HttpZError('Incorrect form-data parameter', ['25'].join(''))

      expect(parser['_parseFormDataBody'].bind(parser)).toThrow(err)
    })

    it('should set instance.body when bodyRows is empty', () => {
      const parser = getParserInstance()
      parser['body'] = {}
      parser['headers'] = [
        {
          name: 'Content-Type',
          value: 'multipart/form-data;boundary=11136253119209',
        },
      ]
      parser['bodyRows'] = ''

      parser['_parseFormDataBody']()

      const expected = {
        boundary: '11136253119209',
        params: [],
      }
      expect(parser['body']).toEqual(expected)
    })

    it('should set instance.body when bodyRows contains all valid params', () => {
      const parser = getParserInstance()
      parser['body'] = {}
      parser['headers'] = [
        {
          name: 'Content-Type',
          value: 'multipart/form-data;boundary=11136253119209',
        },
      ]
      parser['bodyRows'] = [
        '--11136253119209',
        'Content-Disposition: form-data; name="firstName"',
        '',
        'John',
        '--11136253119209',
        'Content-Disposition: form-data; name="age"',
        '',
        '',
        '--11136253119209--',
      ].join(EOL)

      parser['_parseFormDataBody']()

      const expected = {
        boundary: '11136253119209',
        params: [
          { name: 'firstName', value: 'John' },
          { name: 'age', value: '' },
        ],
      }
      expect(parser['body']).toEqual(expected)
    })
  })

  describe('_parseUrlencodedBody', () => {
    function test(bodyRows: string, expected: HttpZHeader[]): void {
      const parser = getParserInstance()
      parser['body'] = {}
      parser['bodyRows'] = bodyRows

      parser['_parseUrlencodedBody']()
      expect(parser['body'].params).toEqual(expected)
    }

    it('should set instance.body when bodyRows is empty', () => {
      const bodyRows = ''
      const expected: HttpZHeader[] = []

      test(bodyRows, expected)
    })

    it('should set instance.body when bodyRows has two simple parameters', () => {
      const bodyRows = 'p1=v1&p2%3E=v2%3B'
      const expected = [
        { name: 'p1', value: 'v1' },
        { name: 'p2>', value: 'v2;' },
      ]

      test(bodyRows, expected)
    })

    it('should set instance.body when bodyRows has object parameters', () => {
      const bodyRows = 'p1[x]=v1&p1[y]=v2&p2%3E=v2%3B'
      const expected = [
        { name: 'p1[x]', value: 'v1' },
        { name: 'p1[y]', value: 'v2' },
        { name: 'p2>', value: 'v2;' },
      ]

      test(bodyRows, expected)
    })

    it('should set instance.body when bodyRows has array parameters', () => {
      const bodyRows = 'p1[]=v1&p1[]=v2&p2%3E=v2%3B'
      const expected = [
        { name: 'p1[]', value: 'v1' },
        { name: 'p1[]', value: 'v2' },
        { name: 'p2>', value: 'v2;' },
      ]

      test(bodyRows, expected)
    })
  })

  describe('_parseTextBody', () => {
    it('should set instance.body', () => {
      const parser = getParserInstance()
      parser['body'] = {}
      parser['bodyRows'] = 'body'

      parser['_parseTextBody']()

      const expected = {
        text: 'body',
      }
      expect(parser['body']).toEqual(expected)
    })
  })

  describe('_calcSizes', () => {
    it('should calc instance.sizes using instance.headers and instance.body', () => {
      const parser = getParserInstance(`headers${EOL2X}body`)
      parser['_calcSizes']('headers', 'body')

      const expected = {
        headersSize: 11,
        bodySize: 4,
      }
      expect(parser['headersSize']).toEqual(expected.headersSize)
      expect(parser['bodySize']).toEqual(expected.bodySize)
    })
  })

  describe('_getContentTypeValue', () => {
    function getDefaultHeaders(): HttpZHeader[] {
      return [
        {
          name: 'Connection',
          value: 'keep-alive',
        },
        {
          name: 'Accept-Encoding',
          value: 'gzip, deflate',
        },
        {
          name: 'Content-Type',
          value: 'application/json',
        },
      ]
    }

    it('should return undefined when instance.headers does not include contentType header', () => {
      const parser = getParserInstance()
      parser['headers'] = getDefaultHeaders()
      parser['headers'].splice(2, 1)

      const expected = undefined
      const actual = parser['_getContentTypeValue']()

      expect(actual).toEqual(expected)
    })

    it('should return undefined when contentType header value is undefined', () => {
      const parser = getParserInstance()
      parser['headers'] = getDefaultHeaders()
      parser['headers'][2].value = ''

      const expected = undefined
      const actual = parser['_getContentTypeValue']()

      expect(actual).toEqual(expected)
    })

    it('should return contentType value in lower case when instance.headers contains it', () => {
      const parser = getParserInstance()
      parser['headers'] = getDefaultHeaders()

      const expected = 'application/json'
      const actual = parser['_getContentTypeValue']()

      expect(actual).toEqual(expected)
    })
  })

  describe('_getBoundary', () => {
    function getDefaultHeaders(): HttpZHeader[] {
      return [
        {
          name: 'Connection',
          value: 'keep-alive',
        },
        {
          name: 'Accept-Encoding',
          value: 'gzip, deflate',
        },
        {
          name: 'Content-Type',
          value: 'multipart/form-data;boundary="1232:1312312"',
        },
      ]
    }

    it('should throw error when instance.headers does not include contentType header', () => {
      const parser = getParserInstance()
      parser['headers'] = getDefaultHeaders()
      parser['headers'].splice(2, 1)
      const err = new HttpZError('Message with multipart/form-data body must have Content-Type header with boundary')

      expect(parser['_getBoundary'].bind(parser)).toThrow(err)
    })

    it('should throw error when contentType header params is undefined', () => {
      const parser = getParserInstance()
      parser['headers'] = getDefaultHeaders()
      parser['headers'][2].value = 'multipart/form-data'
      const err = new HttpZError('Message with multipart/form-data body must have Content-Type header with boundary')

      expect(parser['_getBoundary'].bind(parser)).toThrow(err)
    })

    it('should throw error when contentType header params does not contain boundary', () => {
      const parser = getParserInstance()
      parser['headers'] = getDefaultHeaders()
      parser['headers'][2].value = 'multipart/form-data;some params'
      const err = new HttpZError('Incorrect boundary, expected: boundary=value', 'some params')

      expect(parser['_getBoundary'].bind(parser)).toThrow(err)
    })

    it('should return boundary without quotes when contentType header is exists and valid', () => {
      const parser = getParserInstance()
      parser['headers'] = getDefaultHeaders()

      const expected = '1232:1312312'
      const actual = parser['_getBoundary']()

      expect(actual).toEqual(expected)
    })
  })
})
