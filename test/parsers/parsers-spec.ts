import { EOL } from '../../src/constants'
import { HttpZError } from '../../src/error'
import parser from '../../src/parsers/index'
import { HttpZRequestParser } from '../../src/parsers/request'
import { HttpZResponseParser } from '../../src/parsers/response'

describe('parsers / index', () => {
  let _parseRequestSpy: jest.SpyInstance
  let _parseResponseSpy: jest.SpyInstance

  beforeAll(() => {
    _parseRequestSpy = jest.spyOn(HttpZRequestParser, 'parse')
    _parseResponseSpy = jest.spyOn(HttpZResponseParser, 'parse')
  })

  afterEach(() => {
    _parseRequestSpy.mockReset()
    _parseResponseSpy.mockReset()
  })

  afterAll(() => {
    _parseRequestSpy.mockRestore()
    _parseResponseSpy.mockRestore()
  })

  it('should throw error when rawMessage is nil', () => {
    const err = new HttpZError('rawMessage is required')

    expect(parser.bind(null, undefined as any)).toThrow(err)
    expect(parser.bind(null, null as any)).toThrow(err)
  })

  it('should throw error when rawMessage is not a string', () => {
    const err = new HttpZError('rawMessage must be a string')

    expect(parser.bind(null, 123 as any)).toThrow(err)
    expect(parser.bind(null, true as any)).toThrow(err)
    expect(parser.bind(null, {} as any)).toThrow(err)
    expect(parser.bind(null, [] as any)).toThrow(err)
  })

  it('should throw error when rawMessage has incorrect format', () => {
    const params = ['invalid']
    const err = new HttpZError('rawMessage has incorrect format')

    expect(parser.bind(null, ...params)).toThrow(err)
  })

  it('should call HttpZRequestParser.parse when rawMessage is request', () => {
    const rawMessage = ['GET /features HTTP/1.1', 'host: example.com', ''].join(EOL)
    const expected = 'parsed-request'
    const expectedArgs = [rawMessage, {}]

    _parseRequestSpy.mockReturnValue('parsed-request')

    const actual = parser(rawMessage)
    expect(actual).toEqual(expected)

    expect(_parseRequestSpy).toHaveBeenCalledTimes(1)
    expect(_parseRequestSpy).toHaveBeenCalledWith(...expectedArgs)
  })

  it('should call HttpZResponseParser.parse when rawMessage is response', () => {
    const rawMessage = ['HTTP/1.1 200 Ok', 'host: example.com', ''].join(EOL)
    const expected = 'parsed-response'
    const expectedArgs = rawMessage

    _parseResponseSpy.mockReturnValue('parsed-response')

    const actual = parser(rawMessage)
    expect(actual).toEqual(expected)

    expect(_parseResponseSpy).toHaveBeenCalledTimes(1)
    expect(_parseResponseSpy).toHaveBeenCalledWith(expectedArgs)
  })
})
