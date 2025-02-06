import builder from '../../src/builders/index'
import { HttpZRequestBuilder } from '../../src/builders/request'
import { HttpZResponseBuilder } from '../../src/builders/response'
import { HttpZError } from '../../src/error'

describe('builders / index', () => {
  let _buildRequestSpy: jest.SpyInstance
  let _buildResponseSpy: jest.SpyInstance

  beforeAll(() => {
    _buildRequestSpy = jest.spyOn(HttpZRequestBuilder, 'build')
    _buildResponseSpy = jest.spyOn(HttpZResponseBuilder, 'build')
  })

  afterEach(() => {
    _buildRequestSpy.mockReset()
    _buildResponseSpy.mockReset()
  })

  afterAll(() => {
    _buildRequestSpy.mockRestore()
    _buildResponseSpy.mockRestore()
  })

  it('should throw error when messageModel is nil', () => {
    const err = new HttpZError('messageModel is required')

    expect(builder.bind(null, undefined as any)).toThrow(err)
    expect(builder.bind(null, null as any)).toThrow(err)
  })

  it('should throw error when messageModel is not a plain object', () => {
    const err = new HttpZError('messageModel must be a plain object')
    expect(builder.bind(null, 123 as any)).toThrow(err)
    expect(builder.bind(null, true as any)).toThrow(err)
    expect(builder.bind(null, 'message' as any)).toThrow(err)
    expect(builder.bind(null, ['message'] as any)).toThrow(err)
  })

  it('should throw error when model has incorrect format', () => {
    const messageModel = {
      data: 'some data',
    }
    const err = new HttpZError('messageModel has incorrect format')

    expect(builder.bind(null, messageModel as any)).toThrow(err)
  })

  it('should call HttpZRequestBuilder.build when messageModel is request', () => {
    const messageModel = {
      method: 'GET',
    }
    const expected = 'built-request'
    const expectedArgs = [messageModel, {}]

    _buildRequestSpy.mockReturnValue('built-request')

    const actual = builder(messageModel as any)
    expect(actual).toEqual(expected)

    expect(_buildRequestSpy).toHaveBeenCalledTimes(1)
    expect(_buildRequestSpy).toHaveBeenCalledWith(...expectedArgs)
  })

  it('should call HttpZResponseBuilder.build when messageModel is response', () => {
    const messageModel = {
      statusCode: 200,
    }
    const expected = 'built-response'
    const expectedArgs = messageModel

    _buildResponseSpy.mockReturnValue('built-response')

    const actual = builder(messageModel as any)
    expect(actual).toEqual(expected)

    expect(_buildResponseSpy).toHaveBeenCalledTimes(1)
    expect(_buildResponseSpy).toHaveBeenCalledWith(expectedArgs)
  })
})
