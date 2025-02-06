import { HttpZResponseBuilder } from '../../src/builders/response'
import { HttpZBuilderResponseModel } from '../../src/builders/types'
import { EOL, HttpProtocolVersion } from '../../src/constants'
import { HttpZError } from '../../src/error'

describe('builders / response', () => {
  function getBuilderInstance(ex: Partial<HttpZBuilderResponseModel> = {}): HttpZResponseBuilder {
    const responseModel: HttpZBuilderResponseModel = {
      protocolVersion: HttpProtocolVersion.http11,
      statusCode: 200,
      statusMessage: 'Ok',
      headers: [],
      ...ex,
    }
    return new HttpZResponseBuilder(responseModel)
  }

  describe('static build', () => {
    let _buildResponseSpy: jest.SpyInstance

    beforeAll(() => {
      _buildResponseSpy = jest.spyOn(HttpZResponseBuilder, 'build')
    })

    afterEach(() => {
      _buildResponseSpy.mockReset()
    })

    afterAll(() => {
      _buildResponseSpy.mockRestore()
    })

    it('should create instance of HttpZResponseBuilder and call instance.build', () => {
      const responseModel = {} as HttpZBuilderResponseModel
      const expected = 'ok'

      _buildResponseSpy.mockReturnValue('ok')

      const actual = HttpZResponseBuilder.build(responseModel)
      expect(actual).toEqual(expected)

      expect(_buildResponseSpy).toHaveBeenCalledTimes(1)
      expect(_buildResponseSpy).toHaveBeenCalledWith({})
    })
  })

  describe('build', () => {
    it('should call related methods and return response message', () => {
      const builder = getBuilderInstance()
      builder['_generateStartRow'] = jest.fn(() => 'startRow' + EOL)
      builder['_generateHeaderRows'] = jest.fn(() => 'headerRows' + EOL)
      builder['_generateBodyRows'] = jest.fn(() => 'bodyRows')

      const expected = ['startRow', 'headerRows', '', 'bodyRows'].join(EOL)
      const actual = builder.build()
      expect(actual).toEqual(expected)

      expect(builder['_generateStartRow']).toHaveBeenCalledTimes(1)
      expect(builder['_generateStartRow']).toHaveBeenCalledWith()
      expect(builder['_generateHeaderRows']).toHaveBeenCalledTimes(1)
      expect(builder['_generateHeaderRows']).toHaveBeenCalledWith()
      expect(builder['_generateBodyRows']).toHaveBeenCalledTimes(1)
      expect(builder['_generateBodyRows']).toHaveBeenCalledWith()
    })
  })

  describe('_generateStartRow', () => {
    it('should throw error when protocolVersion is undefined', () => {
      const err = new HttpZError('protocolVersion is required')

      const builder = getBuilderInstance({ protocolVersion: undefined })
      expect(builder['_generateStartRow'].bind(builder)).toThrow(err)
    })

    it('should throw error when statusCode is undefined', () => {
      const err = new HttpZError('statusCode is required')

      const builder = getBuilderInstance({ statusCode: undefined })
      expect(builder['_generateStartRow'].bind(builder)).toThrow(err)
    })

    it('should throw error when statusMessage is undefined', () => {
      const err = new HttpZError('statusMessage is required')

      const builder = getBuilderInstance({ statusMessage: undefined })
      expect(builder['_generateStartRow'].bind(builder)).toThrow(err)
    })

    it('should build startRow when all params are valid', () => {
      const expected = 'HTTP/1.1 200 Ok' + EOL

      const builder = getBuilderInstance()
      const actual = builder['_generateStartRow']()
      expect(actual).toEqual(expected)
    })
  })

  describe('functional tests', () => {
    it('should build response without body (header names in lower case)', () => {
      const responseModel: HttpZBuilderResponseModel = {
        protocolVersion: HttpProtocolVersion.http11,
        statusCode: 201,
        statusMessage: 'Created',
        headers: [
          {
            name: 'connection',
            value: '',
          },
          {
            name: 'cache-Control',
            value: 'no-cache',
          },
          {
            name: 'Content-type',
            value: 'text/plain;charset=UTF-8',
          },
          {
            name: 'content-encoding',
            value: 'gzip, deflate',
          },
        ],
      }

      const rawResponse = [
        'HTTP/1.1 201 Created',
        'Connection: ',
        'Cache-Control: no-cache',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        '',
        '',
      ].join(EOL)

      const builder = getBuilderInstance(responseModel)
      const actual = builder.build()
      expect(actual).toEqual(rawResponse)
    })

    it('should build response with cookies, but without body', () => {
      const responseModel: HttpZBuilderResponseModel = {
        protocolVersion: HttpProtocolVersion.http11,
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
            value: 'text/plain;charset=UTF-8',
          },
          {
            name: 'Content-Encoding',
            value: 'gzip, deflate',
          },
          {
            name: 'Set-Cookie',
            value: 'csrftoken=123abc',
          },
          {
            name: 'Set-Cookie',
            value: 'sessionid=456def; Domain=example.com; Path=/',
          },
        ],
      }

      const rawResponse = [
        'HTTP/1.1 201 Created',
        'Connection: ',
        'Cache-Control: no-cache',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Set-Cookie: csrftoken=123abc',
        'Set-Cookie: sessionid=456def; Domain=example.com; Path=/',
        '',
        '',
      ].join(EOL)

      const builder = getBuilderInstance(responseModel)
      const actual = builder.build()
      expect(actual).toEqual(rawResponse)
    })

    it('should build response with body of contentType=text/plain', () => {
      const responseModel: HttpZBuilderResponseModel = {
        protocolVersion: HttpProtocolVersion.http11,
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
            name: 'Content-Encoding',
            value: 'gzip, deflate',
          },
          {
            name: 'Content-Type',
            value: 'text/plain;charset=UTF-8',
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
      }

      const rawResponse = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Length: 301',
        '',
        'Text data',
      ].join(EOL)

      const builder = getBuilderInstance(responseModel)
      const actual = builder.build()
      expect(actual).toEqual(rawResponse)
    })

    it('should build response with body of contentType=text/plain and transfer-encoding=chunked', () => {
      const responseModel: HttpZBuilderResponseModel = {
        protocolVersion: HttpProtocolVersion.http11,
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
            name: 'Content-Encoding',
            value: 'gzip, deflate',
          },
          {
            name: 'Content-Type',
            value: 'text/plain;charset=UTF-8',
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
      }

      const rawResponse = [
        'HTTP/1.1 200 Ok',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        'Content-Type: text/plain;charset=UTF-8',
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

      const builder = getBuilderInstance(responseModel)
      const actual = builder.build()
      expect(actual).toEqual(rawResponse)
    })
  })
})
