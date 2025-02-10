import { HttpZBaseBuilder } from '../../src/builders/base'
import { EOL } from '../../src/constants'
import { HttpZError } from '../../src/error'
import { HttpZBody, HttpZBodyParam, HttpZHeader } from '../../src/types'
import { isError } from '../../src/utils'
import { ExpectedSpiedFnArgs, testSpiedFn } from '../test-utils'

describe('builders / base', () => {
  function getBuilderInstance(headers?: any, body?: any): HttpZBaseBuilder {
    return new HttpZBaseBuilder(headers, body)
  }

  describe('_generateHeaderRows', () => {
    function getDefaultHeaders(): HttpZHeader[] {
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

      const builder = getBuilderInstance()
      expect(builder['_generateHeaderRows'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.headers is not array', () => {
      const expected = HttpZError.get('headers must be an array')

      const builder = getBuilderInstance('headers')
      expect(builder['_generateHeaderRows'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.headers contains header without name', () => {
      const headers = getDefaultHeaders()
      headers[1].name = undefined as any
      const expected = HttpZError.get('header name is required', 'header index: 1')

      const builder = getBuilderInstance(headers)
      expect(builder['_generateHeaderRows'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.headers contains header with empty name', () => {
      const headers = getDefaultHeaders()
      headers[1].name = ''
      const expected = HttpZError.get('header name must be not empty string', 'header index: 1')

      const builder = getBuilderInstance(headers)
      expect(builder['_generateHeaderRows'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.headers contains header without value', () => {
      const headers = getDefaultHeaders()
      headers[2].value = undefined as any
      const expected = HttpZError.get('header.value is required', 'header index: 2')

      const builder = getBuilderInstance(headers)
      expect(builder['_generateHeaderRows'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.headers contains header with value that is not a string', () => {
      const headers = getDefaultHeaders()
      headers[2].value = 25 as any
      const expected = HttpZError.get('header.value must be a string', 'header index: 2')

      const builder = getBuilderInstance(headers)
      expect(builder['_generateHeaderRows'].bind(builder)).toThrow(expected)
    })

    it('should return empty string when instance.headers is empty array', () => {
      const headers: HttpZHeader[] = []
      const expected = ''

      const builder = getBuilderInstance(headers)
      const actual = builder['_generateHeaderRows']()
      expect(actual).toEqual(expected)
    })

    it('should return headerRows when instance.headers is valid', () => {
      const headers = getDefaultHeaders()
      const expected = [
        'Connection: ',
        'Accept: */*, text/plain',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: en-US;q=0.6, en;q=0.4',
        '',
      ].join(EOL)

      const builder = getBuilderInstance(headers)
      const actual = builder['_generateHeaderRows']()
      expect(actual).toEqual(expected)
    })
  })

  describe('_generateBodyRows', () => {
    type SpiedFn =
      | '_processTransferEncodingChunked'
      | '_generateFormDataBody'
      | '_generateUrlencodedBody'
      | '_generateTextBody'

    function test(body: HttpZBody | null, expected: unknown, expectedFnArgs?: ExpectedSpiedFnArgs<SpiedFn>): void {
      const builder = getBuilderInstance([], body)
      builder['_processTransferEncodingChunked'] = jest.fn(() => {})
      builder['_generateFormDataBody'] = jest.fn(() => 'FormDataBody')
      builder['_generateUrlencodedBody'] = jest.fn(() => 'UrlencodedBody')
      builder['_generateTextBody'] = jest.fn(() => 'TextBody')

      if (!isError(expected)) {
        const actual = builder['_generateBodyRows']()
        expect(actual).toEqual(expected)
      } else {
        expect(builder['_generateBodyRows'].bind(builder)).toThrow(<Error>expected)
      }

      const spiedFnNames: SpiedFn[] = [
        '_processTransferEncodingChunked',
        '_generateFormDataBody',
        '_generateUrlencodedBody',
        '_generateTextBody',
      ];
      spiedFnNames.forEach(fnName => {
        if (!expectedFnArgs) {
          expect(builder[fnName]).toHaveBeenCalledTimes(0)
        } else if (fnName === '_processTransferEncodingChunked') {
          expect(builder[fnName]).toHaveBeenCalledTimes(1)
        } else if (fnName === expectedFnArgs.calledFnName) {
          testSpiedFn(builder[expectedFnArgs.calledFnName], expectedFnArgs.calledTimes, expectedFnArgs.calledWith)
        } else {
          expect(builder[fnName]).toHaveBeenCalledTimes(0)
        }
      })
    }

    it('should return empty string when instance.body is null', () => {
      const body = null
      const expected = ''

      test(body, expected)
    })

    it('should return FormDataBody when instance.body is defined and contentType is multipart/form-data', () => {
      const body = {
        contentType: 'multipart/form-data',
      }
      const expected = 'FormDataBody'
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_generateFormDataBody', calledTimes: 1 }

      test(body, expected, expectedFnArgs)
    })

    it('should return FormDataBody when instance.body is defined and contentType is multipart/alternative', () => {
      const body = {
        contentType: 'multipart/alternative',
      }
      const expected = 'FormDataBody'
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_generateFormDataBody', calledTimes: 1 }

      test(body, expected, expectedFnArgs)
    })

    it('should return FormDataBody when instance.body is defined and contentType is multipart/mixed', () => {
      const body = {
        contentType: 'multipart/mixed',
      }
      const expected = 'FormDataBody'
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_generateFormDataBody', calledTimes: 1 }

      test(body, expected, expectedFnArgs)
    })

    it('should return FormDataBody when instance.body is defined and contentType is multipart/related', () => {
      const body = {
        contentType: 'multipart/related',
      }
      const expected = 'FormDataBody'
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_generateFormDataBody', calledTimes: 1 }

      test(body, expected, expectedFnArgs)
    })

    it('should return UrlencodedBody when instance.body is defined and contentType is application/x-www-form-urlencoded', () => {
      const body = {
        contentType: 'application/x-www-form-urlencoded',
      }
      const expected = 'UrlencodedBody'
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_generateUrlencodedBody', calledTimes: 1 }

      test(body, expected, expectedFnArgs)
    })

    it('should return TextBody when instance.body is defined and contentType is text/plain', () => {
      const body = {
        contentType: 'text/plain',
      }
      const expected = 'TextBody'
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_generateTextBody', calledTimes: 1 }

      test(body, expected, expectedFnArgs)
    })

    it('should return TextBody when instance.body is defined and contentType is unknown', () => {
      const body = {
        contentType: 'unknown',
      }
      const expected = 'TextBody'
      const expectedFnArgs: ExpectedSpiedFnArgs<SpiedFn> = { calledFnName: '_generateTextBody', calledTimes: 1 }

      test(body, expected, expectedFnArgs)
    })
  })

  describe('_processTransferEncodingChunked', () => {
    function getDefaultBody(): HttpZBody {
      return {
        text: 'This is a long string\r\n11\r\n with new lines and numbers',
      }
    }

    it("should don't body when transfer-encoding is not chunked", () => {
      const headers: HttpZHeader[] = []
      const body = getDefaultBody()

      const builder = getBuilderInstance(headers, body)
      builder['_processTransferEncodingChunked']()

      const expected = body.text
      expect(builder['body']!.text).toEqual(expected)
    })

    it('should change body when transfer-encoding is chunked', () => {
      const headers = [
        {
          name: 'Transfer-Encoding',
          value: 'chunked',
        },
      ]
      const body = getDefaultBody()

      const builder = getBuilderInstance(headers, body)
      builder['_processTransferEncodingChunked']()

      const expected = ['19', 'This is a long string', '11', '19', '', ' with new lines and num', '4', 'bers'].join(EOL)
      expect(builder['body']!.text).toEqual(expected)
    })
  })

  describe('_generateFormDataBody', () => {
    function getDefaultBody(): HttpZBody {
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

      const builder = getBuilderInstance([], body)
      expect(builder['_generateFormDataBody'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.body.params is not array', () => {
      const body = getDefaultBody()
      body.params = 'params' as any
      const expected = HttpZError.get('body.params must be an array')

      const builder = getBuilderInstance([], body)
      expect(builder['_generateFormDataBody'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.body.boundary is nil', () => {
      const body = getDefaultBody()
      body.boundary = undefined
      const expected = HttpZError.get('body.boundary is required')

      const builder = getBuilderInstance([], body)
      expect(builder['_generateFormDataBody'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.body.boundary is not a string', () => {
      const body = getDefaultBody()
      body.boundary = 12345 as any
      const expected = HttpZError.get('body.boundary must be a string')

      const builder = getBuilderInstance([], body)
      expect(builder['_generateFormDataBody'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.body.boundary is empty string', () => {
      const body = getDefaultBody()
      body.boundary = ''
      const expected = HttpZError.get('body.boundary must be not empty string')

      const builder = getBuilderInstance([], body)
      expect(builder['_generateFormDataBody'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.body.params contains param with empty name', () => {
      const body = getDefaultBody()
      body.params![0].name = ''
      const expected = HttpZError.get('body.params[index].name must be not empty string', 'param index: 0')

      const builder = getBuilderInstance([], body)
      expect(builder['_generateFormDataBody'].bind(builder)).toThrow(expected)
    })

    it('should not throw error when instance.body.params contains param with empty name and type is not form-data', () => {
      const body = getDefaultBody()
      body.params![0].type = 'inline'
      body.params![0].name = ''

      const builder = getBuilderInstance([], body)
      expect(builder['_generateFormDataBody'].bind(builder)).not.toThrow(HttpZError)
    })

    it('should return empty string when instance.body.params is empty array', () => {
      const body = getDefaultBody()
      body.params = []
      const expected = ''

      const builder = getBuilderInstance([], body)
      const actual = builder['_generateFormDataBody']()
      expect(actual).toEqual(expected)
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
      ].join(EOL)

      const builder = getBuilderInstance([], body)
      const actual = builder['_generateFormDataBody']()
      expect(actual).toEqual(expected)
    })
  })

  describe('_generateUrlencodedBody', () => {
    function getDefaultBody(params?: HttpZBodyParam[]): HttpZBody {
      return {
        params,
      }
    }

    it('should throw error when instance.body.params is undefined', () => {
      const body = getDefaultBody()
      const expected = HttpZError.get('body.params is required')

      const builder = getBuilderInstance([], body)
      expect(builder['_generateUrlencodedBody'].bind(builder)).toThrow(expected)
    })

    it('should throw error when instance.body.params is not array', () => {
      const body = getDefaultBody('params' as any)
      const expected = HttpZError.get('body.params must be an array')

      const builder = getBuilderInstance([], body)
      expect(builder['_generateUrlencodedBody'].bind(builder)).toThrow(expected)
    })

    it('should return empty string when instance.body.params is empty', () => {
      const body = getDefaultBody([])
      const expected = ''

      const builder = getBuilderInstance([], body)
      const actual = builder['_generateUrlencodedBody']()
      expect(actual).toEqual(expected)
    })

    it('should return BodyRows when instance.body.params has two simple parameters', () => {
      const body = getDefaultBody([
        { name: 'p1', value: 'v1' },
        { name: 'p2>', value: 'v2;' },
      ])
      const expected = 'p1=v1&p2%3E=v2%3B'

      const builder = getBuilderInstance([], body)
      const actual = builder['_generateUrlencodedBody']()
      expect(actual).toEqual(expected)
    })

    it('should return BodyRows when instance.body.params has object parameters', () => {
      const body = getDefaultBody([
        { name: 'p1[x]', value: 'v1' },
        { name: 'p1[y]', value: 'v2' },
        { name: 'p2>', value: 'v2;' },
      ])
      const expected = 'p1%5Bx%5D=v1&p1%5By%5D=v2&p2%3E=v2%3B'

      const builder = getBuilderInstance([], body)
      const actual = builder['_generateUrlencodedBody']()
      expect(actual).toEqual(expected)
    })

    it('should return BodyRows when instance.body.params has array parameters', () => {
      const body = getDefaultBody([
        { name: 'p1[]', value: 'v1' },
        { name: 'p1[]', value: 'v2' },
        { name: 'p2>', value: 'v2;' },
      ])
      const expected = 'p1%5B%5D=v1&p1%5B%5D=v2&p2%3E=v2%3B'

      const builder = getBuilderInstance([], body)
      const actual = builder['_generateUrlencodedBody']()
      expect(actual).toEqual(expected)
    })
  })

  describe('_generateTextBody', () => {
    function getDefaultBody(): HttpZBody {
      return {
        text: 'text data',
      }
    }

    it('should return empty string when instance.body.text is empty', () => {
      const body = getDefaultBody()
      body.text = ''
      const expected = ''

      const builder = getBuilderInstance([], body)
      const actual = builder['_generateTextBody']()
      expect(actual).toEqual(expected)
    })

    it('should return Body when instance.body.text is not empty', () => {
      const body = getDefaultBody()
      const expected = 'text data'

      const builder = getBuilderInstance([], body)
      const actual = builder['_generateTextBody']()
      expect(actual).toEqual(expected)
    })
  })
})
