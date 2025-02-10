import { build } from '../src/builders/index'
import { HttpZError } from '../src/error'
import * as httpZ from '../src/index'
import { parse } from '../src/parsers/index'

describe('httpz', () => {
  it('should httpz.consts be defined', () => {
    expect(httpZ.consts).toBeDefined()
  })

  it('should httpz.utils be defined', () => {
    expect(httpZ.utils).toBeDefined()
  })

  it('should httpz.HttpZError be a class', () => {
    expect(httpZ.HttpZError).toBe(HttpZError)
  })

  it('should httpz.parse be a function', () => {
    expect(httpZ.parse).toBe(parse)
  })

  it('should httpz.build be a function', () => {
    expect(httpZ.build).toBe(build)
  })
})
