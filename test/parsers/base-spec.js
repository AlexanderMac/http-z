const sinon = require('sinon')
const should = require('should')
const nassert = require('n-assert')
const HttpZConsts = require('../../src/consts')
const HttpZError = require('../../src/error')
const BaseParser = require('../../src/parsers/base')

describe('parsers / base', () => {
  function getParserInstance(...params) {
    return new BaseParser(...params)
  }

  describe('_parseMessageForRows', () => {
    it('should throw error when message does not have start-line', () => {
      let rawRequest = ['', 'Body'].join(HttpZConsts.EOL)
      let parser = getParserInstance(rawRequest)

      should(parser._parseMessageForRows.bind(parser)).throw(Error, {
        message: 'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]'
      })
    })

    it('should throw error when message does not have empty line between headers and body', () => {
      let rawRequest = ['start-line', 'host-line', 'Header1'].join(HttpZConsts.EOL)
      let parser = getParserInstance(rawRequest)

      should(parser._parseMessageForRows.bind(parser)).throw(HttpZError, {
        message: 'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]'
      })
    })

    it('should parse message for rows without body', () => {
      let rawRequest = ['start-line', 'host-line', 'Header1', 'Header2', 'Header3', 'Cookie', '', ''].join(
        HttpZConsts.EOL
      )
      let parser = getParserInstance(rawRequest)

      let actual = parser._parseMessageForRows()
      should(actual.startRow).eql('start-line')
      should(actual.headerRows).eql(['host-line', 'Header1', 'Header2', 'Header3', 'Cookie'])
      should(actual.bodyRows).eql('')
      should(parser.headersSize).equal(60)
      should(parser.bodySize).equal(0)
    })

    it('should parse message for rows with body', () => {
      let rawRequest = ['start-line', 'host-line', 'Header1', 'Header2', 'Header3', 'Cookie', '', 'Body'].join(
        HttpZConsts.EOL
      )
      let parser = getParserInstance(rawRequest)

      let actual = parser._parseMessageForRows()
      should(actual.startRow).eql('start-line')
      should(actual.headerRows).eql(['host-line', 'Header1', 'Header2', 'Header3', 'Cookie'])
      should(actual.bodyRows).eql('Body')
      should(parser.headersSize).equal(60)
      should(parser.bodySize).equal(4)
    })
  })

  describe('_parseHeaderRows', () => {
    it('should throw error when headerRows has invalid format', () => {
      let parser = getParserInstance()
      parser.headerRows = ['Header1: value', 'Header2 - value', 'Header3:    value   ']

      should(parser._parseHeaderRows.bind(parser)).throw(HttpZError, {
        message: 'Incorrect header row format, expected: Name: Value',
        details: 'Header2 - value'
      })
    })

    it('should set instance.headers when headerRows is valid', () => {
      let parser = getParserInstance()
      parser.headerRows = [
        'Connection:',
        'Accept: */*, text/plain',
        'accept-Encoding: gzip, deflate   ',
        'Accept-language: ru-RU, ru; q=0.8,en-US;q=0.6,en;  q=0.4'
      ]
      parser._parseHeaderRows()

      let expected = [
        {
          name: 'Connection',
          value: ''
        },
        {
          name: 'Accept',
          value: '*/*, text/plain'
        },
        {
          name: 'Accept-Encoding',
          value: 'gzip, deflate'
        },
        {
          name: 'Accept-Language',
          value: 'ru-RU, ru; q=0.8,en-US;q=0.6,en;  q=0.4'
        }
      ]
      should(parser.headers).eql(expected)
    })
  })

  describe('_parseBodyRows', () => {
    // eslint-disable-next-line object-curly-spacing
    function test({ headers, bodyRows, expected, expectedFnArgs = {} }) {
      let parser = getParserInstance()
      sinon.stub(parser, '_processTransferEncodingChunked')
      sinon.stub(parser, '_parseFormDataBody').callsFake(() => {
        parser.body.params = 'body'
      })
      sinon.stub(parser, '_parseUrlencodedBody').callsFake(() => {
        parser.body.params = 'body'
      })
      sinon.stub(parser, '_parseTextBody').callsFake(() => {
        parser.body.text = 'body'
      })
      parser.headers = headers
      parser.bodyRows = bodyRows

      parser._parseBodyRows()
      should(parser.body).eql(expected)

      nassert.assertFn({ inst: parser, fnName: '_parseFormDataBody', expectedArgs: expectedFnArgs.parseFormDataBody })
      nassert.assertFn({
        inst: parser,
        fnName: '_parseUrlencodedBody',
        expectedArgs: expectedFnArgs.parseUrlencodedBody
      })
      nassert.assertFn({ inst: parser, fnName: '_parseTextBody', expectedArgs: expectedFnArgs.parseTextBody })
    }

    it('should set instance.body to undefined when bodyRows is empty', () => {
      let bodyRows
      let expected

      test({ bodyRows, expected })
    })

    it('should set instance.body.params when bodyRows is defined and contentType header is multipart/form-data', () => {
      let headers = [{ name: 'Content-Type', value: 'multipart/form-data' }]
      let bodyRows = 'body'
      let expected = {
        contentType: 'multipart/form-data',
        params: 'body'
      }
      let expectedFnArgs = { parseFormDataBody: '_without-args_' }

      test({ headers, bodyRows, expected, expectedFnArgs })
    })

    it('should set instance.body.params when bodyRows is defined and contentType header is application/x-www-form-urlencoded', () => {
      let headers = [{ name: 'Content-Type', value: 'application/x-www-form-urlencoded' }]
      let bodyRows = 'body'
      let expected = {
        contentType: 'application/x-www-form-urlencoded',
        params: 'body'
      }
      let expectedFnArgs = { parseUrlencodedBody: '_without-args_' }

      test({ headers, bodyRows, expected, expectedFnArgs })
    })

    it('should set instance.body.text when bodyRows is defined and contentType header is text/plain', () => {
      let headers = [{ name: 'Content-Type', value: 'text/plain' }]
      let bodyRows = 'body'
      let expected = {
        contentType: 'text/plain',
        text: 'body'
      }
      let expectedFnArgs = { parseTextBody: '_without-args_' }

      test({ headers, bodyRows, expected, expectedFnArgs })
    })

    it('should set instance.body.text when bodyRows is defined and contentType header is missing', () => {
      let bodyRows = 'body'
      let expected = {
        text: 'body'
      }
      let expectedFnArgs = { parseTextBody: '_without-args_' }

      test({ bodyRows, expected, expectedFnArgs })
    })
  })

  describe('_processTransferEncodingChunked', () => {
    function getDefaultBodyRows() {
      return ['19', 'This is a long string', '11', '19', '', ' with new lines and num', '4', 'bers'].join(
        HttpZConsts.EOL
      )
    }

    it("should don't change bodyRows when transfer-encoding is not chunked", () => {
      let parser = getParserInstance()
      parser.headers = []
      parser.bodyRows = getDefaultBodyRows()

      parser._processTransferEncodingChunked()

      const expected = parser.bodyRows
      should(parser.bodyRows).eql(expected)
    })

    it('should change bodyRows when transfer-encoding is chunked', () => {
      let parser = getParserInstance()
      parser.headers = [
        {
          name: 'Transfer-Encoding',
          value: 'chunked'
        }
      ]
      parser.bodyRows = getDefaultBodyRows()

      parser._processTransferEncodingChunked()

      const expected = 'This is a long string\r\n11\r\n with new lines and numbers'
      should(parser.bodyRows).eql(expected)
    })

    it('should throw error when transfer-encoding is chunked but body has incorrect format', () => {
      let parser = getParserInstance()
      parser.headers = [
        {
          name: 'Transfer-Encoding',
          value: 'chunked'
        }
      ]
      parser.bodyRows = '5\r\nStart\r\n2\r\nEnd\r\n'

      should(parser._processTransferEncodingChunked.bind(parser)).throw(HttpZError, {
        message: 'Incorrect row, expected: NumberEOL',
        details: parser.bodyRows
      })
    })
  })

  describe('_parseFormDataBody', () => {
    it('should throw error when bodyRows contains param with incorrect format', () => {
      let parser = getParserInstance()
      parser.body = {}
      parser.headers = [
        {
          name: 'Content-Type',
          value: 'multipart/form-data;boundary=11136253119209'
        }
      ]
      parser.bodyRows = [
        '--11136253119209',
        'Content-Disposition: form-data; name="firstName"',
        '',
        'John',
        '--11136253119209',
        'Content-Disposition: form-data; name="age"',
        '25',
        '--11136253119209--'
      ].join(HttpZConsts.EOL)

      should(parser._parseFormDataBody.bind(parser)).throw(HttpZError, {
        message: 'Incorrect form-data parameter',
        details: ['25'].join('')
      })
    })

    it('should set instance.body when bodyRows is empty', () => {
      let parser = getParserInstance()
      parser.body = {}
      parser.headers = [
        {
          name: 'Content-Type',
          value: 'multipart/form-data;boundary=11136253119209'
        }
      ]
      parser.bodyRows = ''

      parser._parseFormDataBody()

      let expected = {
        boundary: '11136253119209',
        params: []
      }
      should(parser.body).eql(expected)
    })

    it('should set instance.body when bodyRows contains all valid params', () => {
      let parser = getParserInstance()
      parser.body = {}
      parser.headers = [
        {
          name: 'Content-Type',
          value: 'multipart/form-data;boundary=11136253119209'
        }
      ]
      parser.bodyRows = [
        '--11136253119209',
        'Content-Disposition: form-data; name="firstName"',
        '',
        'John',
        '--11136253119209',
        'Content-Disposition: form-data; name="age"',
        '',
        '',
        '--11136253119209--'
      ].join(HttpZConsts.EOL)

      parser._parseFormDataBody()

      let expected = {
        boundary: '11136253119209',
        params: [
          { name: 'firstName', value: 'John' },
          { name: 'age', value: '' }
        ]
      }
      should(parser.body).eql(expected)
    })
  })

  describe('_parseUrlencodedBody', () => {
    function test({ bodyRows, expected }) {
      let parser = getParserInstance()
      parser.body = {}
      parser.bodyRows = bodyRows

      parser._parseUrlencodedBody()
      should(parser.body.params).eql(expected)
    }

    it('should set instance.body when bodyRows is empty', () => {
      let bodyRows = ''
      let expected = []

      test({ bodyRows, expected })
    })

    it('should set instance.body when bodyRows has two simple parameters', () => {
      let bodyRows = 'p1=v1&p2%3E=v2%3B'
      let expected = [
        { name: 'p1', value: 'v1' },
        { name: 'p2>', value: 'v2;' }
      ]

      test({ bodyRows, expected })
    })

    it('should set instance.body when bodyRows has object parameters', () => {
      let bodyRows = 'p1[x]=v1&p1[y]=v2&p2%3E=v2%3B'
      let expected = [
        { name: 'p1[x]', value: 'v1' },
        { name: 'p1[y]', value: 'v2' },
        { name: 'p2>', value: 'v2;' }
      ]

      test({ bodyRows, expected })
    })

    it('should set instance.body when bodyRows has array parameters', () => {
      let bodyRows = 'p1[]=v1&p1[]=v2&p2%3E=v2%3B'
      let expected = [
        { name: 'p1[]', value: 'v1' },
        { name: 'p1[]', value: 'v2' },
        { name: 'p2>', value: 'v2;' }
      ]

      test({ bodyRows, expected })
    })
  })

  describe('_parseTextBody', () => {
    it('should set instance.body', () => {
      let parser = getParserInstance()
      parser.body = {}
      parser.bodyRows = 'body'

      parser._parseTextBody()

      let expected = {
        text: 'body'
      }
      should(parser.body).eql(expected)
    })
  })

  describe('_calcSizes', () => {
    it('should calc instance.sizes using instance.headers and instance.body', () => {
      let parser = getParserInstance(`headers${HttpZConsts.EOL2X}body`)
      parser._calcSizes('headers', 'body')

      let expected = {
        headersSize: 11,
        bodySize: 4
      }
      should(parser.headersSize).eql(expected.headersSize)
      should(parser.bodySize).eql(expected.bodySize)
    })
  })

  describe('_getContentTypeValue', () => {
    function getDefaultHeaders() {
      return [
        {
          name: 'Connection',
          value: 'keep-alive'
        },
        {
          name: 'Accept-Encoding',
          value: 'gzip, deflate'
        },
        {
          name: 'Content-Type',
          value: 'application/json'
        }
      ]
    }

    it('should return undefined when instance.headers does not include contentType header', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()
      parser.headers.splice(2, 1)

      let expected
      let actual = parser._getContentTypeValue()

      should(actual).eql(expected)
    })

    it('should return undefined when contentType header value is undefined', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()
      parser.headers[2].value = ''

      let expected
      let actual = parser._getContentTypeValue()

      should(actual).eql(expected)
    })

    it('should return contentType value in lower case when instance.headers contains it', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()

      let expected = 'application/json'
      let actual = parser._getContentTypeValue()

      should(actual).eql(expected)
    })
  })

  describe('_getBoundary', () => {
    function getDefaultHeaders() {
      return [
        {
          name: 'Connection',
          value: 'keep-alive'
        },
        {
          name: 'Accept-Encoding',
          value: 'gzip, deflate'
        },
        {
          name: 'Content-Type',
          value: 'multipart/form-data;boundary="1232:1312312"'
        }
      ]
    }

    it('should throw error when instance.headers does not include contentType header', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()
      parser.headers.splice(2, 1)

      should(parser._getBoundary.bind(parser)).throw(HttpZError, {
        message: 'Message with multipart/form-data body must have Content-Type header with boundary'
      })
    })

    it('should throw error when contentType header params is undefined', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()
      parser.headers[2].value = 'multipart/form-data'

      should(parser._getBoundary.bind(parser)).throw(HttpZError, {
        message: 'Message with multipart/form-data body must have Content-Type header with boundary'
      })
    })

    it('should throw error when contentType header params does not contain boundary', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()
      parser.headers[2].value = 'multipart/form-data;some params'

      should(parser._getBoundary.bind(parser)).throw(HttpZError, {
        message: 'Incorrect boundary, expected: boundary=value',
        details: 'some params'
      })
    })

    it('should return boundary without quotes when contentType header is exists and valid', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()

      let expected = '1232:1312312'
      let actual = parser._getBoundary()

      should(actual).eql(expected)
    })
  })
})
