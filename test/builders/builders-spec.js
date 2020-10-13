const sinon = require('sinon')
const should = require('should')
const nassert = require('n-assert')
const HttpZError = require('../../src/error')
const builder = require('../../src/builders')
const RequestBuilder = require('../../src/builders/request')
const ResponseBuilder = require('../../src/builders/response')

describe('builders / index', () => {
  beforeEach(() => {
    sinon.stub(RequestBuilder, 'build')
    sinon.stub(ResponseBuilder, 'build')
  })

  afterEach(() => {
    RequestBuilder.build.restore()
    ResponseBuilder.build.restore()
  })

  it('should throw error when messageModel is nil', () => {
    const ERR = {
      message: 'messageModel is required'
    }
    should(builder.bind(null, undefined)).throw(HttpZError, ERR)
    should(builder.bind(null, null)).throw(HttpZError, ERR)
  })

  it('should throw error when messageModel is not a plain object', () => {
    const ERR = {
      message: 'messageModel must be a plain object'
    }
    should(builder.bind(null, 123)).throw(HttpZError, ERR)
    should(builder.bind(null, 'message')).throw(HttpZError, ERR)
    should(builder.bind(null, ['message'])).throw(HttpZError, ERR)
  })

  it('should throw error when model has unknown format', () => {
    let messageModel = {
      data: 'some data'
    }

    should(builder.bind(null, messageModel)).throw(HttpZError, {
      message: 'Unknown messageModel format'
    })
  })

  it('should call RequestBuilder.build when messageModel is request', () => {
    let messageModel = {
      method: 'GET'
    }
    let expected = 'built-request'
    let expectedArgs = messageModel

    RequestBuilder.build.returns('built-request')

    let actual = builder(messageModel)
    should(actual).eql(expected)

    nassert.assertFn({ inst: RequestBuilder, fnName: 'build', expectedArgs })
  })

  it('should call ResponseBuilder.build when messageModel is response', () => {
    let messageModel = {
      statusCode: 200
    }
    let expected = 'built-response'
    let expectedArgs = messageModel

    ResponseBuilder.build.returns('built-response')

    let actual = builder(messageModel)
    should(actual).eql(expected)

    nassert.assertFn({ inst: ResponseBuilder, fnName: 'build', expectedArgs })
  })
})
