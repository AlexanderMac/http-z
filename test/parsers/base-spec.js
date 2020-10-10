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
    it('should throw error when message does not have headers', () => {
      let plainRequest = [
        '',
        'Body'
      ].join(HttpZConsts.EOL)
      let parser = getParserInstance(plainRequest)

      should(parser._parseMessageForRows.bind(parser)).throw(Error, {
        message: 'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]'
      })
    })

    it('should throw error when message does not have empty line and body', () => {
      let plainRequest = [
        'start-line',
        'host-line',
        'Header1'
      ].join(HttpZConsts.EOL)
      let parser = getParserInstance(plainRequest)

      should(parser._parseMessageForRows.bind(parser)).throw(HttpZError, {
        message: 'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]'
      })
    })

    function _testParseMessageWithoutBody() {
      let plainRequest = [
        'start-line',
        'host-line',
        'Header1',
        'Header2',
        'Header3',
        'Cookie',
        '',
        ''
      ].join(HttpZConsts.EOL)
      let parser = getParserInstance(plainRequest)

      let actual = parser._parseMessageForRows()
      should(actual.startRow).eql('start-line')
      should(actual.headerRows).eql(['host-line', 'Header1', 'Header2', 'Header3', 'Cookie'])
      should(actual.bodyRows).eql('')
    }

    it('should parse message for rows without body', () => {
      _testParseMessageWithoutBody()
    })

    function _testParseMessageWithBody() {
      let plainRequest = [
        'start-line',
        'host-line',
        'Header1',
        'Header2',
        'Header3',
        'Cookie',
        '',
        'Body'
      ].join(HttpZConsts.EOL)
      let parser = getParserInstance(plainRequest)

      let actual = parser._parseMessageForRows()
      should(actual.startRow).eql('start-line')
      should(actual.headerRows).eql(['host-line', 'Header1', 'Header2', 'Header3', 'Cookie'])
      should(actual.bodyRows).eql('Body')
    }

    it('should parse message for rows with body', () => {
      _testParseMessageWithBody()
    })
  })

  describe('_parseHeaderRows', () => {
    it('should throw error when headerRow has invalid format', () => {
      let parser = getParserInstance()
      parser.headerRows = [
        'Header1: values',
        'Header2 - values',
        'Header3:    values   '
      ]

      should(parser._parseHeaderRows.bind(parser)).throw(HttpZError, {
        message: 'Incorrect header row format, expected: Name: Values',
        details: 'Header2 - values'
      })
    })

    it('should set instance.headers when headerRows are valid', () => {
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
          values: []
        },
        {
          name: 'Accept',
          values: [
            { value: '*/*' },
            { value: 'text/plain' }
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
      ]
      should(parser.headers).eql(expected)
    })
  })

  describe('_parseBodyRows', () => {
    function test({ headers, bodyRows, expected, expectedFnArgs = {}}) {
      let parser = getParserInstance()
      sinon.stub(parser, '_parseFormDataBody').callsFake(() => parser.body.params = 'body')
      sinon.stub(parser, '_parseUrlencodedBody').callsFake(() => parser.body.params = 'body')
      sinon.stub(parser, '_parseTextBody').callsFake(() => parser.body.text = 'body')
      parser.headers = headers
      parser.bodyRows = bodyRows

      parser._parseBodyRows()
      should(parser.body).eql(expected)

      nassert.assertFn({ inst: parser, fnName: '_parseFormDataBody', expectedArgs: expectedFnArgs.parseFormDataBody })
      nassert.assertFn({ inst: parser, fnName: '_parseUrlencodedBody', expectedArgs: expectedFnArgs.parseUrlencodedBody })
      nassert.assertFn({ inst: parser, fnName: '_parseTextBody', expectedArgs: expectedFnArgs.parseTextBody })
    }

    it('should set instance.body to undefined when bodyRows is empty', () => {
      let bodyRows = undefined
      let expected = undefined

      test({ bodyRows, expected })
    })

    it('should set instance.body when bodyRows are valid and contentType header is multipart/form-data', () => {
      let headers = [{ name: 'Content-Type', values: [{ value: 'multipart/form-data' }] }]
      let bodyRows = 'body'
      let expected = {
        contentType: 'multipart/form-data',
        params: 'body'
      }
      let expectedFnArgs = { parseFormDataBody: '_without-args_' }

      test({ headers, bodyRows, expected, expectedFnArgs })
    })

    it('should set instance.body when bodyRows are valid and contentType header is application/x-www-form-urlencoded', () => {
      let headers = [{ name: 'Content-Type', values: [{ value: 'application/x-www-form-urlencoded' }] }]
      let bodyRows = 'body'
      let expected = {
        contentType: 'application/x-www-form-urlencoded',
        params: 'body'
      }
      let expectedFnArgs = { parseUrlencodedBody: '_without-args_' }

      test({ headers, bodyRows, expected, expectedFnArgs })
    })

    it('should set instance.body when bodyRows are valid and contentType header is text/plain', () => {
      let headers = [{ name: 'Content-Type', values: [{ value: 'text/plain' }] }]
      let bodyRows = 'body'
      let expected = {
        contentType: 'text/plain',
        text: 'body'
      }
      let expectedFnArgs = { parseTextBody: '_without-args_' }

      test({ headers, bodyRows, expected, expectedFnArgs })
    })

    it('should set instance.body when bodyRows are valid and contentType header is missing', () => {
      let bodyRows = 'body'
      let expected = {
        contentType: undefined,
        text: 'body'
      }
      let expectedFnArgs = { parseTextBody: '_without-args_' }

      test({ bodyRows, expected, expectedFnArgs })
    })
  })

  describe('_parseFormDataBody', () => {
    it('should throw error when some param has incorrect format', () => {
      let parser = getParserInstance()
      parser.body = {}
      parser.headers = [{
        name: 'Content-Type',
        values: [
          { value: 'multipart/form-data', params: 'boundary=11136253119209' }
        ]
      }]
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
        details: [
          '25'
        ].join('')
      })
    })

    it('should set instance.body when all params in body are valid', () => {
      let parser = getParserInstance()
      parser.body = {}
      parser.headers = [{
        name: 'Content-Type',
        values: [
          { value: 'multipart/form-data', params: 'boundary=11136253119209' }
        ]
      }]
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
    it('should set instance.body when all params in body are valid', () => {
      let parser = getParserInstance()
      parser.body = {}
      parser.bodyRows = 'firstName=John&lastName=Smith&age='

      parser._parseUrlencodedBody()

      let expected = {
        params: [
          { name: 'firstName', value: 'John' },
          { name: 'lastName', value: 'Smith' },
          { name: 'age', value: '' }
        ]
      }
      should(parser.body).eql(expected)
    })
  })

  describe('_parseTextBody', () => {
    it('should set instance.body using bodyRows', () => {
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
    it('should calc instance.sizes using header and body rows', () => {
      let parser = getParserInstance('plain message')
      parser._calcSizes('headers', 'body')

      let expected = {
        messageSize: 13,
        headersSize: 7,
        bodySize: 4
      }
      should(parser.messageSize).eql(expected.messageSize)
      should(parser.headersSize).eql(expected.headersSize)
      should(parser.bodySize).eql(expected.bodySize)
    })
  })

  describe('_getContentTypeHeader', () => {
    function getDefaultHeaders() {
      return [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive' }
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
          name: 'Content-Type',
          values: [
            { value: 'application/json' }
          ]
        }
      ]
    }

    it('should return undefined when instance.headers does not include contentType header', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()
      parser.headers.splice(2, 1)

      let expected = undefined
      let actual = parser._getContentTypeHeader()

      should(actual).eql(expected)
    })

    it('should return contentType value', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()

      let expected = { value: 'application/json' }
      let actual = parser._getContentTypeHeader()

      should(actual).eql(expected)
    })
  })

  describe('_getContentType', () => {
    function getDefaultHeaders() {
      return [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive' }
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
          name: 'Content-Type',
          values: [
            { value: 'Application/json' }
          ]
        }
      ]
    }

    it('should return undefined when instance.headers does not include contentType header', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()
      parser.headers.splice(2, 1)

      let expected = undefined
      let actual = parser._getContentType()

      should(actual).eql(expected)
    })

    it('should return contentType value', () => {
      let parser = getParserInstance()
      parser.headers = getDefaultHeaders()

      let expected = 'application/json'
      let actual = parser._getContentType()

      should(actual).eql(expected)
    })
  })
})
