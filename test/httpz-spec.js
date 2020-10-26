const should = require('should')
const httpZ = require('../')

describe('httpz', ()=> {
  it('should httpz.consts be an object', () => {
    should(httpZ.consts).is.Object()
  })

  it('should httpz.HttpZError be a function', () => {
    should(httpZ.HttpZError).is.Function()
  })

  it('should httpz.parse be a function', () => {
    should(httpZ.parse).is.Function()
  })

  it('should httpz.build be a function', () => {
    should(httpZ.build).is.Function()
  })
})
