import { HttpZRequestBuilder } from '../../src/builders/request'
import { HttpZBuilderRequestModel } from '../../src/builders/types'
import { EOL, HttpMethod, HttpProtocolVersion } from '../../src/constants'
import { HttpZError } from '../../src/error'

describe('builders / request', () => {
  function getBuilderInstance(ex: Partial<HttpZBuilderRequestModel> = {}, opts = {}): HttpZRequestBuilder {
    const requestModel: HttpZBuilderRequestModel = {
      protocolVersion: HttpProtocolVersion.http11,
      method: HttpMethod.get,
      target: '/',
      headers: [],
      ...ex,
    }
    return new HttpZRequestBuilder(requestModel, opts)
  }

  describe('static build', () => {
    let _buildRequestSpy: jest.SpyInstance

    beforeAll(() => {
      _buildRequestSpy = jest.spyOn(HttpZRequestBuilder, 'build')
    })

    afterEach(() => {
      _buildRequestSpy.mockReset()
    })

    afterAll(() => {
      _buildRequestSpy.mockRestore()
    })

    it('should create instance of HttpZRequestBuilder and call instance.build', () => {
      const requestModel = {} as HttpZBuilderRequestModel
      const expected = 'ok'
      const expectedArgs = [requestModel, {}]

      _buildRequestSpy.mockReturnValue('ok')

      const actual = HttpZRequestBuilder.build(requestModel, {})
      expect(actual).toEqual(expected)

      expect(_buildRequestSpy).toHaveBeenCalledTimes(1)
      expect(_buildRequestSpy).toHaveBeenCalledWith(...expectedArgs)
    })
  })

  describe('build', () => {
    it('should call related methods and return request message', () => {
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
    it('should throw error when method is undefined', () => {
      const err = new HttpZError('method is required')

      const builder = getBuilderInstance({ method: undefined })
      expect(builder['_generateStartRow'].bind(builder)).toThrow(err)
    })

    it('should throw error when protocolVersion is undefined', () => {
      const err = new HttpZError('protocolVersion is required')

      const builder = getBuilderInstance({ protocolVersion: undefined })
      expect(builder['_generateStartRow'].bind(builder)).toThrow(err)
    })

    it('should throw error when target is undefined', () => {
      const err = new HttpZError('target is required')

      const builder = getBuilderInstance({ target: undefined })
      expect(builder['_generateStartRow'].bind(builder)).toThrow(err)
    })

    it('should build startRow when all params are valid', () => {
      const expected = 'GET / HTTP/1.1' + EOL

      const builder = getBuilderInstance()
      const actual = builder['_generateStartRow']()
      expect(actual).toEqual(expected)
    })
  })

  describe('_generateHeaderRows', () => {
    it('should throw error when opts.mandatoryHost is true and host header is missing', () => {
      const err = new HttpZError('Host header is required')

      const builder = getBuilderInstance(
        { headers: [{ name: 'Some-Header', value: 'SomeValue' }] },
        { mandatoryHost: true },
      )
      expect(builder['_generateHeaderRows'].bind(builder)).toThrow(err)
    })

    it('should build headerRows when opts.mandatoryHost is false and host header is missing', () => {
      const expected = 'Some-Header: SomeValue' + EOL

      const builder = getBuilderInstance(
        { headers: [{ name: 'Some-Header', value: 'SomeValue' }] },
        { mandatoryHost: false },
      )
      const actual = builder['_generateHeaderRows']()
      expect(actual).toEqual(expected)
    })

    it('should build headerRows when opts.mandatoryHost is true and host header is present', () => {
      const expected = 'Host: SomeHost' + EOL + 'Some-Header: SomeValue' + EOL

      const builder = getBuilderInstance(
        {
          headers: [
            { name: 'Host', value: 'SomeHost' },
            { name: 'Some-Header', value: 'SomeValue' },
          ],
        },
        { mandatoryHost: true },
      )
      const actual = builder['_generateHeaderRows']()
      expect(actual).toEqual(expected)
    })
  })

  describe('functional tests', () => {
    it('should build request without headers and body', () => {
      const requestModel: HttpZBuilderRequestModel = {
        method: HttpMethod.get,
        protocolVersion: HttpProtocolVersion.http11,
        target: '/features?p1=v1%3B&p2=',
        headers: [{ name: 'Host', value: 'example.com' }],
      }

      const rawRequest = ['GET /features?p1=v1%3B&p2= HTTP/1.1', 'Host: example.com', '', ''].join(EOL)

      const builder = getBuilderInstance(requestModel)
      const actual = builder.build()
      expect(actual).toEqual(rawRequest)
    })

    it('should build request without body (header names in lower case)', () => {
      const requestModel: HttpZBuilderRequestModel = {
        method: HttpMethod.get,
        protocolVersion: HttpProtocolVersion.http11,
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com',
          },
          {
            name: 'connection',
            value: '',
          },
          {
            name: 'accept',
            value: '*/*',
          },
          {
            name: 'cache-Control',
            value: 'no-cache',
          },
          {
            name: 'content-encoding',
            value: 'gzip, deflate',
          },
        ],
      }

      const rawRequest = [
        'GET /features HTTP/1.1',
        'Host: example.com',
        'Connection: ',
        'Accept: */*',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        '',
        '',
      ].join(EOL)

      const builder = getBuilderInstance(requestModel)
      const actual = builder.build()
      expect(actual).toEqual(rawRequest)
    })

    it('should build request with cookies, but without body', () => {
      const requestModel: HttpZBuilderRequestModel = {
        method: HttpMethod.get,
        protocolVersion: HttpProtocolVersion.http11,
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'www.example.com',
          },
          {
            name: 'Connection',
            value: '',
          },
          {
            name: 'Accept',
            value: '*/*',
          },
          {
            name: 'Accept-Encoding',
            value: 'gzip, deflate',
          },
          {
            name: 'Accept-Language',
            value: 'ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
          },
          {
            name: 'Cookie',
            value: 'csrftoken=123abc; sessionid=456def%3B; username=',
          },
        ],
      }

      const rawRequest = [
        'GET /features HTTP/1.1',
        'Host: www.example.com',
        'Connection: ',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Cookie: csrftoken=123abc; sessionid=456def%3B; username=',
        '',
        '',
      ].join(EOL)

      const builder = getBuilderInstance(requestModel)
      const actual = builder.build()
      expect(actual).toEqual(rawRequest)
    })

    it('should build request with body of contentType=text/plain', () => {
      const requestModel: HttpZBuilderRequestModel = {
        method: HttpMethod.post,
        protocolVersion: HttpProtocolVersion.http11,
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com',
          },
          {
            name: 'Connection',
            value: 'keep-alive',
          },
          {
            name: 'Accept',
            value: '*/*',
          },
          {
            name: 'Accept-Encoding',
            value: 'gzip, deflate',
          },
          {
            name: 'Accept-Language',
            value: 'ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
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
            name: 'Content-Length',
            value: '301',
          },
        ],
        body: {
          contentType: 'text/plain',
          text: 'Text data',
        },
      }

      const rawRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        'Text data',
      ].join(EOL)

      const builder = getBuilderInstance(requestModel)
      const actual = builder.build()
      expect(actual).toEqual(rawRequest)
    })

    it('should build request with body of contentType=application/x-www-form-urlencoded', () => {
      const requestModel: HttpZBuilderRequestModel = {
        method: HttpMethod.post,
        protocolVersion: HttpProtocolVersion.http11,
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com',
          },
          {
            name: 'Connection',
            value: 'keep-alive',
          },
          {
            name: 'Accept',
            value: '*/*',
          },
          {
            name: 'Accept-Encoding',
            value: 'gzip, deflate',
          },
          {
            name: 'Accept-Language',
            value: 'ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
          },
          {
            name: 'Content-Type',
            value: 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          {
            name: 'Content-Encoding',
            value: 'gzip, deflate',
          },
          {
            name: 'Content-Length',
            value: '301',
          },
        ],
        body: {
          contentType: 'application/x-www-form-urlencoded',
          params: [{ name: 'firstName', value: 'John' }, { name: 'lastName' }, { name: 'age', value: '25;' }],
        },
      }

      const rawRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: application/x-www-form-urlencoded;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        '',
        'firstName=John&lastName=&age=25%3B',
      ].join(EOL)

      const builder = getBuilderInstance(requestModel)
      const actual = builder.build()
      expect(actual).toEqual(rawRequest)
    })

    it('should build request with body of contentType=multipart/form-data', () => {
      const requestModel: HttpZBuilderRequestModel = {
        method: HttpMethod.post,
        protocolVersion: HttpProtocolVersion.http11,
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com',
          },
          {
            name: 'Connection',
            value: 'keep-alive',
          },
          {
            name: 'Accept',
            value: '*/*',
          },
          {
            name: 'Accept-Encoding',
            value: 'gzip, deflate',
          },
          {
            name: 'Accept-Language',
            value: 'ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
          },
          {
            name: 'Content-Type',
            value: 'multipart/form-data;boundary="111362:53119209"',
          },
          {
            name: 'Content-Encoding',
            value: 'gzip, deflate',
          },
          {
            name: 'Content-Length',
            value: '301',
          },
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
              value: '<binary-data>',
            },
            {
              contentType: 'text/plain',
              name: 'bio',
              value: 'some info\r\nmore info\r\n',
            },
          ],
        },
      }

      const rawRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: multipart/form-data;boundary="111362:53119209"',
        'Content-Encoding: gzip, deflate',
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
        '--111362:53119209--',
      ].join(EOL)

      const builder = getBuilderInstance(requestModel)
      const actual = builder.build()
      expect(actual).toEqual(rawRequest)
    })

    it('should build request with body of contentType=multipart/alternative (inline)', () => {
      const requestModel: HttpZBuilderRequestModel = {
        method: HttpMethod.post,
        protocolVersion: HttpProtocolVersion.http11,
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com',
          },
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
            name: 'Content-Length',
            value: '301',
          },
          {
            name: 'Content-Type',
            value: 'multipart/alternative;boundary="111362-53119209"',
          },
        ],
        body: {
          contentType: 'multipart/alternative',
          boundary: '111362-53119209',
          params: [
            {
              type: 'inline',
              value: '<base64-data>',
            },
          ],
        },
      }
      const rawRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        'Content-Type: multipart/alternative;boundary="111362-53119209"',
        '',
        '--111362-53119209',
        'Content-Disposition: inline',
        '',
        '<base64-data>',
        '--111362-53119209--',
      ].join(EOL)

      const builder = getBuilderInstance(requestModel)
      const actual = builder.build()
      expect(actual).toEqual(rawRequest)
    })

    it('should build request with body of contentType=multipart/mixed (attachment)', () => {
      const requestModel: HttpZBuilderRequestModel = {
        method: HttpMethod.post,
        protocolVersion: HttpProtocolVersion.http11,
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com',
          },
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
            name: 'Content-Length',
            value: '301',
          },
          {
            name: 'Content-Type',
            value: 'multipart/mixed;boundary="11136253119209"',
          },
        ],
        body: {
          contentType: 'multipart/mixed',
          boundary: '11136253119209',
          params: [
            {
              type: 'attachment',
              contentType: 'application/octet-stream',
              fileName: 'photo1.jpg',
              value: '<binary-data>',
            },
          ],
        },
      }
      const rawRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Cache-Control: no-cache',
        'Content-Encoding: gzip, deflate',
        'Content-Length: 301',
        'Content-Type: multipart/mixed;boundary="11136253119209"',
        '',
        '--11136253119209',
        'Content-Disposition: attachment; filename="photo1.jpg"',
        'Content-Type: application/octet-stream',
        '',
        '<binary-data>',
        '--11136253119209--',
      ].join(EOL)

      const builder = getBuilderInstance(requestModel)
      const actual = builder.build()
      expect(actual).toEqual(rawRequest)
    })

    it('should build request with body of contentType=text/plain and transfer-encoding=chunked', () => {
      const requestModel: HttpZBuilderRequestModel = {
        method: HttpMethod.post,
        protocolVersion: HttpProtocolVersion.http11,
        target: '/features',
        headers: [
          {
            name: 'Host',
            value: 'example.com',
          },
          {
            name: 'Connection',
            value: 'keep-alive',
          },
          {
            name: 'Accept',
            value: '*/*',
          },
          {
            name: 'Accept-Encoding',
            value: 'gzip, deflate',
          },
          {
            name: 'Accept-Language',
            value: 'ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
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
            name: 'Transfer-Encoding',
            value: 'chunked',
          },
        ],
        body: {
          contentType: 'text/plain',
          text: 'The Transfer-Encoding header specifies the form of encoding used to safely transfer the payload body to the user',
        },
      }

      const rawRequest = [
        'POST /features HTTP/1.1',
        'Host: example.com',
        'Connection: keep-alive',
        'Accept: */*',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
        'Content-Type: text/plain;charset=UTF-8',
        'Content-Encoding: gzip, deflate',
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

      const builder = getBuilderInstance(requestModel)
      const actual = builder.build()
      expect(actual).toEqual(rawRequest)
    })
  })
})
