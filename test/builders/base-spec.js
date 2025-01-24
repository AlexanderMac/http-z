const sinon = require('sinon')
const should = require('should')
const nassert = require('n-assert')
const { isError } = require('../../src/utils')
const HttpZConsts = require('../../src/consts')
const HttpZError = require('../../src/error')
const BaseBuilder = require('../../src/builders/base')

describe('builders / base', () => {
  function getBuilderInstance(...params) {
    return new BaseBuilder(...params)
  }

  describe('_generateHeaderRows', () => {
    function getDefaultHeaders() {
      return [
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
          value: 'en-US;q=0.6, en;q=0.4',
        },
      ]
    }

    it('should throw error when instance.headers is undefined', () => {
      const expected = HttpZError.get('headers is required')

      const builder = getBuilderInstance({})
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.headers is not array', () => {
      const expected = HttpZError.get('headers must be an array')

      const builder = getBuilderInstance({ headers: 'headers' })
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.headers contains header without name', () => {
      const headers = getDefaultHeaders()
      headers[1].name = undefined
      const expected = HttpZError.get('header name is required', 'header index: 1')

      const builder = getBuilderInstance({ headers })
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.headers contains header with empty name', () => {
      const headers = getDefaultHeaders()
      headers[1].name = undefined
      const expected = HttpZError.get('header name is required', 'header index: 1')

      const builder = getBuilderInstance({ headers })
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.headers contains header without value', () => {
      const headers = getDefaultHeaders()
      headers[2].value = undefined
      const expected = HttpZError.get('header.value is required', 'header index: 2')

      const builder = getBuilderInstance({ headers })
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.headers contains header with value that is not a string', () => {
      const headers = getDefaultHeaders()
      headers[2].value = 25
      const expected = HttpZError.get('header.value must be a string', 'header index: 2')

      const builder = getBuilderInstance({ headers })
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should return empty string when instance.headers is empty array', () => {
      const headers = []
      const expected = ''

      const builder = getBuilderInstance({ headers })
      const actual = builder._generateHeaderRows()
      should(actual).eql(expected)
    })

    it('should return headerRows when instance.headers is valid', () => {
      const headers = getDefaultHeaders()
      const expected = [
        'Connection: ',
        'Accept: */*, text/plain',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: en-US;q=0.6, en;q=0.4',
        '',
      ].join(HttpZConsts.EOL)

      const builder = getBuilderInstance({ headers })
      const actual = builder._generateHeaderRows()
      should(actual).eql(expected)
    })
  })

  describe('_generateBodyRows', () => {
    // eslint-disable-next-line object-curly-spacing
    function test({ body, expected, expectedFnArgs = {} }) {
      const builder = getBuilderInstance({ body })
      sinon.stub(builder, '_processTransferEncodingChunked')
      sinon.stub(builder, '_generateFormDataBody').returns('FormDataBody')
      sinon.stub(builder, '_generateUrlencodedBody').returns('UrlencodedBody')
      sinon.stub(builder, '_generateTextBody').returns('TextBody')

      if (!isError(expected)) {
        const actual = builder._generateBodyRows()
        should(actual).eql(expected)
      } else {
        should(builder._generateBodyRows.bind(builder)).throw(HttpZError, expected)
      }

      nassert.assertFn({
        inst: builder,
        fnName: '_generateFormDataBody',
        expectedArgs: expectedFnArgs.genFormDataBody,
      })
      nassert.assertFn({
        inst: builder,
        fnName: '_generateUrlencodedBody',
        expectedArgs: expectedFnArgs.genUrlencodedBody,
      })
      nassert.assertFn({ inst: builder, fnName: '_generateTextBody', expectedArgs: expectedFnArgs.genTextBody })
    }

    it('should return empty string when instance.body is nil', () => {
      const body = null
      const expected = ''

      test({ body, expected })
    })

    it('should return FormDataBody when instance.body is not nil and contentType is multipart/form-data', () => {
      const body = {
        contentType: 'multipart/form-data',
      }
      const expected = 'FormDataBody'
      const expectedFnArgs = { genFormDataBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return FormDataBody when instance.body is not nil and contentType is multipart/alternative', () => {
      const body = {
        contentType: 'multipart/alternative',
      }
      const expected = 'FormDataBody'
      const expectedFnArgs = { genFormDataBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return FormDataBody when instance.body is not nil and contentType is multipart/mixed', () => {
      const body = {
        contentType: 'multipart/mixed',
      }
      const expected = 'FormDataBody'
      const expectedFnArgs = { genFormDataBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return FormDataBody when instance.body is not nil and contentType is multipart/related', () => {
      const body = {
        contentType: 'multipart/related',
      }
      const expected = 'FormDataBody'
      const expectedFnArgs = { genFormDataBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return UrlencodedBody when instance.body is not nil and contentType is application/x-www-form-urlencoded', () => {
      const body = {
        contentType: 'application/x-www-form-urlencoded',
      }
      const expected = 'UrlencodedBody'
      const expectedFnArgs = { genUrlencodedBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return TextBody when instance.body is not nil and contentType is text/plain', () => {
      const body = {
        contentType: 'text/plain',
      }
      const expected = 'TextBody'
      const expectedFnArgs = { genTextBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return TextBody when instance.body is not nil and contentType is unknown', () => {
      const body = {
        contentType: 'unknown',
      }
      const expected = 'TextBody'
      const expectedFnArgs = { genTextBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })
  })

  describe('_processTransferEncodingChunked', () => {
    function getDefaultBody() {
      return {
        text: 'This is a long string\r\n11\r\n with new lines and numbers',
      }
    }

    it("should don't body when transfer-encoding is not chunked", () => {
      const headers = []
      const body = getDefaultBody()

      const builder = getBuilderInstance({ headers, body })
      builder._processTransferEncodingChunked()

      const expected = body.text
      should(builder.body.text).equal(expected)
    })

    it('should change body when transfer-encoding is chunked', () => {
      const headers = [
        {
          name: 'Transfer-Encoding',
          value: 'chunked',
        },
      ]
      const body = getDefaultBody()

      const builder = getBuilderInstance({ headers, body })
      builder._processTransferEncodingChunked()

      const expected = ['19', 'This is a long string', '11', '19', '', ' with new lines and num', '4', 'bers'].join(
        HttpZConsts.EOL,
      )
      should(builder.body.text).equal(expected)
    })
  })

  describe('_generateFormDataBody', () => {
    function getDefaultBody() {
      return {
        params: [
          { name: 'firstName', value: 'John' },
          { name: 'lastName', value: 'Smith' },
          { name: 'age', value: '' },
        ],
        boundary: '11136253119209',
      }
    }

    it('should throw error when instance.body.params is nil', () => {
      const body = getDefaultBody()
      body.params = undefined
      const expected = HttpZError.get('body.params is required')

      const builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.params is not array', () => {
      const body = getDefaultBody()
      body.params = 'params'
      const expected = HttpZError.get('body.params must be an array')

      const builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.boundary is nil', () => {
      const body = getDefaultBody()
      body.boundary = undefined
      const expected = HttpZError.get('body.boundary is required')

      const builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.boundary is not a string', () => {
      const body = getDefaultBody()
      body.boundary = 12345
      const expected = HttpZError.get('body.boundary must be a string')

      const builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.boundary is empty string', () => {
      const body = getDefaultBody()
      body.boundary = ''
      const expected = HttpZError.get('body.boundary must be not empty string')

      const builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.params contains param with empty name', () => {
      const body = getDefaultBody()
      body.params[0].name = ''
      const expected = HttpZError.get('body.params[index].name must be not empty string', 'param index: 0')

      const builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should not throw error when instance.body.params contains param with empty name and type is not form-data', () => {
      const body = getDefaultBody()
      body.params[0].type = 'inline'
      body.params[0].name = ''

      const builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).not.throw(HttpZError)
    })

    it('should return empty string when instance.body.params is empty array', () => {
      const body = getDefaultBody()
      body.params = []
      const expected = ''

      const builder = getBuilderInstance({ body })
      const actual = builder._generateFormDataBody()
      should(actual).eql(expected)
    })

    it('should return BodyRows with params when instance.body.params is not empty array', () => {
      const body = getDefaultBody()
      const expected = [
        '--11136253119209',
        'Content-Disposition: form-data; name="firstName"',
        '',
        'John',
        '--11136253119209',
        'Content-Disposition: form-data; name="lastName"',
        '',
        'Smith',
        '--11136253119209',
        'Content-Disposition: form-data; name="age"',
        '',
        '',
        '--11136253119209--',
      ].join(HttpZConsts.EOL)

      const builder = getBuilderInstance({ body })
      const actual = builder._generateFormDataBody()
      should(actual).eql(expected)
    })
  })

  describe('_generateUrlencodedBody', () => {
    function getDefaultBody(params) {
      return {
        params,
      }
    }

    it('should throw error when instance.body.params is undefined', () => {
      const body = getDefaultBody()
      const expected = HttpZError.get('body.params is required')

      const builder = getBuilderInstance({ body })
      should(builder._generateUrlencodedBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.params is not array', () => {
      const body = getDefaultBody('params')
      const expected = HttpZError.get('body.params must be an array')

      const builder = getBuilderInstance({ body })
      should(builder._generateUrlencodedBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should return empty string when instance.body.params is empty', () => {
      const body = getDefaultBody([])
      const expected = ''

      const builder = getBuilderInstance({ body })
      const actual = builder._generateUrlencodedBody()
      should(actual).eql(expected)
    })

    it('should return BodyRows when instance.body.params has two simple parameters', () => {
      const body = getDefaultBody([
        { name: 'p1', value: 'v1' },
        { name: 'p2>', value: 'v2;' },
      ])
      const expected = 'p1=v1&p2%3E=v2%3B'

      const builder = getBuilderInstance({ body })
      const actual = builder._generateUrlencodedBody()
      should(actual).eql(expected)
    })

    it('should return BodyRows when instance.body.params has object parameters', () => {
      const body = getDefaultBody([
        { name: 'p1[x]', value: 'v1' },
        { name: 'p1[y]', value: 'v2' },
        { name: 'p2>', value: 'v2;' },
      ])
      const expected = 'p1%5Bx%5D=v1&p1%5By%5D=v2&p2%3E=v2%3B'

      const builder = getBuilderInstance({ body })
      const actual = builder._generateUrlencodedBody()
      should(actual).eql(expected)
    })

    it('should return BodyRows when instance.body.params has array parameters', () => {
      const body = getDefaultBody([
        { name: 'p1[]', value: 'v1' },
        { name: 'p1[]', value: 'v2' },
        { name: 'p2>', value: 'v2;' },
      ])
      const expected = 'p1%5B%5D=v1&p1%5B%5D=v2&p2%3E=v2%3B'

      const builder = getBuilderInstance({ body })
      const actual = builder._generateUrlencodedBody()
      should(actual).eql(expected)
    })
  })

  describe('_generateTextBody', () => {
    function getDefaultBody() {
      return {
        text: 'text data',
      }
    }

    it('should return empty string when instance.body.text is empty', () => {
      const body = getDefaultBody()
      body.text = ''
      const expected = ''

      const builder = getBuilderInstance({ body })
      const actual = builder._generateTextBody()
      should(actual).eql(expected)
    })

    it('should return Body when instance.body.text is not empty', () => {
      const body = getDefaultBody()
      const expected = 'text data'

      const builder = getBuilderInstance({ body })
      const actual = builder._generateTextBody()
      should(actual).eql(expected)
    })
  })
})
