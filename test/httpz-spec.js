const should = require('should')
const httpZ = require('../')

describe('httpz', ()=> {
  it('should httpz.consts be an object', () => {
    should(httpZ.consts).is.Object()
  })

  it('should httpz.HttpZError be an function', () => {
    should(httpZ.HttpZError).is.Function()
  })

  it('should httpz.parse be an function', () => {
    should(httpZ.parse).is.Function()
  })

  it('should httpz.build be an function', () => {
    should(httpZ.build).is.Function()
  })
})
