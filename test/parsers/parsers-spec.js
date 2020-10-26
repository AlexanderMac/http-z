const sinon = require('sinon')
const should = require('should')
const nassert = require('n-assert')
const HttpZConsts = require('../../src/consts')
const HttpZError = require('../../src/error')
const parser = require('../../src/parsers')
const RequestParser = require('../../src/parsers/request')
const ResponseParser = require('../../src/parsers/response')

describe('parsers / index', () => {
  beforeEach(() => {
    sinon.stub(RequestParser, 'parse')
    sinon.stub(ResponseParser, 'parse')
  })

  afterEach(() => {
    RequestParser.parse.restore()
    ResponseParser.parse.restore()
  })

  it('should throw error when plainMessage is nil', () => {
    const ERR = {
      message: 'plainMessage is required'
    }
    should(parser.bind(null, undefined)).throw(HttpZError, ERR)
    should(parser.bind(null, null)).throw(HttpZError, ERR)
  })

  it('should throw error when plainMessage is not a string', () => {
    const ERR = {
      message: 'plainMessage must be a string'
    }
    should(parser.bind(null, 123)).throw(HttpZError, ERR)
    should(parser.bind(null, true)).throw(HttpZError, ERR)
    should(parser.bind(null, {})).throw(HttpZError, ERR)
    should(parser.bind(null, [])).throw(HttpZError, ERR)
  })

  it('should throw error when plainMessage has incorrect format', () => {
    let params = ['invalid']

    should(parser.bind(null, ...params)).throw(HttpZError, {
      message: 'plainMessage has incorrect format'
    })
  })

  it('should call RequestParser.parse when plainMessage is request', () => {
    let plainMessage = [
      'GET /features HTTP/1.1',
      'host: example.com',
      ''
    ].join(HttpZConsts.EOL)
    let expected = 'parsed-request'
    let expectedArgs = plainMessage

    RequestParser.parse.returns('parsed-request')

    let actual = parser(plainMessage)
    should(actual).eql(expected)

    nassert.assertFn({ inst: RequestParser, fnName: 'parse', expectedArgs })
    nassert.assertFn({ inst: ResponseParser, fnName: 'parse' })
  })

  it('should call ResponseParser.parse when plainMessage is response', () => {
    let plainMessage = [
      'HTTP/1.1 200 Ok',
      'host: example.com',
      ''
    ].join(HttpZConsts.EOL)
    let expected = 'parsed-response'
    let expectedArgs = plainMessage

    ResponseParser.parse.returns('parsed-response')

    let actual = parser(plainMessage)
    should(actual).eql(expected)

    nassert.assertFn({ inst: RequestParser, fnName: 'parse' })
    nassert.assertFn({ inst: ResponseParser, fnName: 'parse', expectedArgs })
  })
})
