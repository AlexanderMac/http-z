const _ = require('lodash')
const sinon = require('sinon')
const should = require('should')
const nassert = require('n-assert')
const HttpZConsts = require('../../src/consts')
const HttpZError = require('../../src/error')
const BaseBuilder = require('../../src/builders/base')

describe('builders / base', () => {
  function getBuilderInstance(params) {
    return new BaseBuilder(params)
  }

  describe('_generateHeaderRows', () => {
    function getDefaultHeaders() {
      return [
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
            { value: 'en-US', params: 'q=0.6' },
            { value: 'en', params: 'q=0.4' }
          ]
        }
      ]
    }

    it('should throw error when instance.headers is undefined', () => {
      let expected = HttpZError.get('headers is required')

      let builder = getBuilderInstance({ })
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.headers is not array', () => {
      let expected = HttpZError.get('headers must be an array')

      let builder = getBuilderInstance({ headers: 'headers' })
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.headers contains header without name', () => {
      let headers = getDefaultHeaders()
      headers[1].name = undefined
      let expected = HttpZError.get('header name is required', 'header index: 1')

      let builder = getBuilderInstance({ headers })
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.headers contains header without values', () => {
      let headers = getDefaultHeaders()
      headers[2].values = undefined
      let expected = HttpZError.get('header.values is required', 'header index: 2')

      let builder = getBuilderInstance({ headers })
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.headers contains header with values that is not array', () => {
      let headers = getDefaultHeaders()
      headers[2].values = 'values'
      let expected = HttpZError.get('header.values must be an array', 'header index: 2')

      let builder = getBuilderInstance({ headers })
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected)
    })

    it('should return empty string when instance.headers is empty array', () => {
      let headers = []
      let expected = ''

      let builder = getBuilderInstance({ headers })
      let actual = builder._generateHeaderRows()
      should(actual).eql(expected)
    })

    it('should return headerRows when instance.headers is valid', () => {
      let headers = getDefaultHeaders()
      let expected = [
        'Connection: ',
        'Accept: */*, text/plain',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: en-US;q=0.6, en;q=0.4',
        ''
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance({ headers })
      let actual = builder._generateHeaderRows()
      should(actual).eql(expected)
    })
  })

  describe('_generateBodyRows', () => {
    function test({ body, expected, expectedFnArgs = {}}) {
      let builder = getBuilderInstance({ body })
      sinon.stub(builder, '_generateFormDataBody').returns('FormDataBody')
      sinon.stub(builder, '_generateUrlencodedBody').returns('UrlencodedBody')
      sinon.stub(builder, '_generateTextBody').returns('TextBody')

      if (!_.isError(expected)) {
        let actual = builder._generateBodyRows()
        should(actual).eql(expected)
      } else {
        should(builder._generateBodyRows.bind(builder)).throw(HttpZError, expected)
      }

      nassert.assertFn({ inst: builder, fnName: '_generateFormDataBody', expectedArgs: expectedFnArgs.genFormDataBody })
      nassert.assertFn({ inst: builder, fnName: '_generateUrlencodedBody', expectedArgs: expectedFnArgs.genUrlencodedBody })
      nassert.assertFn({ inst: builder, fnName: '_generateTextBody', expectedArgs: expectedFnArgs.genTextBody })
    }

    it('should return empty string when instance.body is nil', () => {
      let body
      let expected = ''

      test({ body, expected })
    })

    it('should return FormDataBody when instance.body is not nil and contentType is multipart/form-data', () => {
      let body = {
        contentType: 'multipart/form-data'
      }
      let expected = 'FormDataBody'
      let expectedFnArgs = { genFormDataBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return FormDataBody when instance.body is not nil and contentType is multipart/alternative', () => {
      let body = {
        contentType: 'multipart/alternative'
      }
      let expected = 'FormDataBody'
      let expectedFnArgs = { genFormDataBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return FormDataBody when instance.body is not nil and contentType is multipart/mixed', () => {
      let body = {
        contentType: 'multipart/mixed'
      }
      let expected = 'FormDataBody'
      let expectedFnArgs = { genFormDataBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return FormDataBody when instance.body is not nil and contentType is multipart/related', () => {
      let body = {
        contentType: 'multipart/related'
      }
      let expected = 'FormDataBody'
      let expectedFnArgs = { genFormDataBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return UrlencodedBody when instance.body is not nil and contentType is application/x-www-form-urlencoded', () => {
      let body = {
        contentType: 'application/x-www-form-urlencoded'
      }
      let expected = 'UrlencodedBody'
      let expectedFnArgs = { genUrlencodedBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return TextBody when instance.body is not nil and contentType is text/plain', () => {
      let body = {
        contentType: 'text/plain'
      }
      let expected = 'TextBody'
      let expectedFnArgs = { genTextBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })

    it('should return TextBody when instance.body is not nil and contentType is unknown', () => {
      let body = {
        contentType: 'unknown'
      }
      let expected = 'TextBody'
      let expectedFnArgs = { genTextBody: '_without-args_' }

      test({ body, expected, expectedFnArgs })
    })
  })

  describe('_generateFormDataBody', () => {
    function getDefaultBody() {
      return {
        params: [
          { name: 'firstName', value: 'John' },
          { name: 'lastName', value: 'Smith' },
          { name: 'age', value: '' }
        ],
        boundary: '11136253119209'
      }
    }

    it('should throw error when instance.body.params is nil', () => {
      let body = getDefaultBody()
      body.params = undefined
      let expected = HttpZError.get('body.params is required')

      let builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.params is not array', () => {
      let body = getDefaultBody()
      body.params = 'params'
      let expected = HttpZError.get('body.params must be an array')

      let builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.boundary is nil', () => {
      let body = getDefaultBody()
      body.boundary = undefined
      let expected = HttpZError.get('body.boundary is required')

      let builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.boundary is not a string', () => {
      let body = getDefaultBody()
      body.boundary = 12345
      let expected = HttpZError.get('body.boundary must be a string')

      let builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.boundary is empty string', () => {
      let body = getDefaultBody()
      body.boundary = ''
      let expected = HttpZError.get('body.boundary must be not empty string')

      let builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.params contains param with empty name', () => {
      let body = getDefaultBody()
      body.params[0].name = ''
      let expected = HttpZError.get('body.params[index].name must be not empty string', 'param index: 0')

      let builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should not throw error when instance.body.params contains param with empty name and type is not form-data', () => {
      let body = getDefaultBody()
      body.params[0].type = 'inline'
      body.params[0].name = ''

      let builder = getBuilderInstance({ body })
      should(builder._generateFormDataBody.bind(builder)).not.throw(HttpZError)
    })

    it('should return empty string when instance.body.params is empty array', () => {
      let body = getDefaultBody()
      body.params = []
      let expected = ''

      let builder = getBuilderInstance({ body })
      let actual = builder._generateFormDataBody()
      should(actual).eql(expected)
    })

    it('should return BodyRows with params when instance.body.params is not empty array', () => {
      let body = getDefaultBody()
      let expected = [
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
        '--11136253119209--'
      ].join(HttpZConsts.EOL)

      let builder = getBuilderInstance({ body })
      let actual = builder._generateFormDataBody()
      should(actual).eql(expected)
    })
  })

  describe('_generateUrlencodedBody', () => {
    function getDefaultBody(params) {
      return {
        params
      }
    }

    it('should throw error when instance.body.params is undefined', () => {
      let body = getDefaultBody()
      let expected = HttpZError.get('body.params is required')

      let builder = getBuilderInstance({ body })
      should(builder._generateUrlencodedBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should throw error when instance.body.params is not array', () => {
      let body = getDefaultBody('params')
      let expected = HttpZError.get('body.params must be an array')

      let builder = getBuilderInstance({ body })
      should(builder._generateUrlencodedBody.bind(builder)).throw(HttpZError, expected)
    })

    it('should return empty string when instance.body.params is empty', () => {
      let body = getDefaultBody([])
      let expected = ''

      let builder = getBuilderInstance({ body })
      let actual = builder._generateUrlencodedBody()
      should(actual).eql(expected)
    })

    it('should return BodyRows when instance.body.params has two simple parameters', () => {
      let body = getDefaultBody([
        { name: 'p1', value: 'v1' },
        { name: 'p2>', value: 'v2;' }
      ])
      let expected = 'p1=v1&p2%3E=v2%3B'

      let builder = getBuilderInstance({ body })
      let actual = builder._generateUrlencodedBody()
      should(actual).eql(expected)
    })

    it('should return BodyRows when instance.body.params has object parameters', () => {
      let body = getDefaultBody([
        { name: 'p1[x]', value: 'v1' },
        { name: 'p1[y]', value: 'v2' },
        { name: 'p2>', value: 'v2;' }
      ])
      let expected = 'p1%5Bx%5D=v1&p1%5By%5D=v2&p2%3E=v2%3B'

      let builder = getBuilderInstance({ body })
      let actual = builder._generateUrlencodedBody()
      should(actual).eql(expected)
    })

    it('should return BodyRows when instance.body.params has array parameters', () => {
      let body = getDefaultBody([
        { name: 'p1[]', value: 'v1' },
        { name: 'p1[]', value: 'v2' },
        { name: 'p2>', value: 'v2;' }
      ])
      let expected = 'p1%5B%5D=v1&p1%5B%5D=v2&p2%3E=v2%3B'

      let builder = getBuilderInstance({ body })
      let actual = builder._generateUrlencodedBody()
      should(actual).eql(expected)
    })
  })

  describe('_generateTextBody', () => {
    function getDefaultBody() {
      return {
        text: 'text data'
      }
    }

    it('should return empty string when instance.body.text is empty', () => {
      let body = getDefaultBody()
      body.text = ''
      let expected = ''

      let builder = getBuilderInstance({ body })
      let actual = builder._generateTextBody()
      should(actual).eql(expected)
    })

    it('should return BodyRows when instance.body.text is not empty', () => {
      let body = getDefaultBody()
      let expected = 'text data'

      let builder = getBuilderInstance({ body })
      let actual = builder._generateTextBody()
      should(actual).eql(expected)
    })
  })
})
