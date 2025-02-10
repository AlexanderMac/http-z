import * as assertions from '../src/assertions'
import { HttpZError } from '../src/error'

describe('assertions', () => {
  type AssertFn = (...params: any[]) => void

  function assertRequired(fn: AssertFn, name: string): void {
    it('should throw error when val is nil (undefined, null)', () => {
      const err = new HttpZError(`${name} is required`)

      expect(fn.bind(null, undefined, name)).toThrow(err)
      expect(fn.bind(null, null, name)).toThrow(err)
    })
  }

  function assertString(fn: AssertFn, name: string): void {
    it('should throw error when val is not a string (number, date, object, array)', () => {
      const err = new HttpZError('username must be a string')

      expect(fn.bind(null, 10, name)).toThrow(err)
      expect(fn.bind(null, new Date(), name)).toThrow(err)
      expect(fn.bind(null, { val: 10 }, name)).toThrow(err)
      expect(fn.bind(null, [10, 20], name)).toThrow(err)
    })
  }

  function assertNumber(fn: AssertFn, name: string): void {
    it('should throw error when val is not a number (string, date, object, array)', () => {
      const err = new HttpZError('age must be a number')

      expect(fn.bind(null, '10', name)).toThrow(err)
      expect(fn.bind(null, new Date(), name)).toThrow(err)
      expect(fn.bind(null, { val: 10 }, name)).toThrow(err)
      expect(fn.bind(null, [10, 20], name)).toThrow(err)
    })
  }

  describe('assertRequired', () => {
    const name = 'username'

    assertRequired(assertions.assertRequired, name)

    it('should not throw error when val is not nil', () => {
      expect(assertions.assertRequired.bind(null, 'smith', name)).not.toThrow()
    })
  })

  describe('assertString', () => {
    const name = 'username'

    assertRequired(assertions.assertString, name)
    assertString(assertions.assertString, name)
  })

  describe('assertNotEmptyString', () => {
    const name = 'username'

    assertRequired(assertions.assertNotEmptyString, name)
    assertString(assertions.assertNotEmptyString, name)

    it('should throw error when val is an empty string', () => {
      const err = new HttpZError('username must be not empty string')

      expect(assertions.assertNotEmptyString.bind(null, '', name)).toThrow(err)
    })

    it('should not throw error when val is not empty string', () => {
      expect(assertions.assertNotEmptyString.bind(null, 'smith', name)).not.toThrow()
    })
  })

  describe('assertNumber', () => {
    const name = 'age'

    assertRequired(assertions.assertNumber, name)
    assertNumber(assertions.assertNumber, name)

    it('should not throw error when val is a number', () => {
      expect(assertions.assertNumber.bind(null, -10, name)).not.toThrow()
      expect(assertions.assertNumber.bind(null, 25, name)).not.toThrow()
    })
  })

  describe('assertPositiveNumber', () => {
    const name = 'age'

    assertRequired(assertions.assertPositiveNumber, name)
    assertNumber(assertions.assertPositiveNumber, name)

    it('should throw error when val is less or equal to zero', () => {
      expect(assertions.assertPositiveNumber.bind(null, -5, name)).toThrow(
        new HttpZError('age must be a positive number'),
      )
      expect(assertions.assertPositiveNumber.bind(null, 0, name)).toThrow(
        new HttpZError('age must be a positive number'),
      )
    })

    it('should not throw error when val is a positive number', () => {
      expect(assertions.assertPositiveNumber.bind(null, 25, name)).not.toThrow()
    })
  })

  describe('assertArray', () => {
    const name = 'cookies'

    assertRequired(assertions.assertArray, name)

    it('should throw error when val is not an array (string, number, date, object)', () => {
      const err = new HttpZError('cookies must be an array')

      expect(assertions.assertArray.bind(null, '10', name)).toThrow(err)
      expect(assertions.assertArray.bind(null, 10, name)).toThrow(err)
      expect(assertions.assertArray.bind(null, new Date(), name)).toThrow(err)
      expect(assertions.assertArray.bind(null, { val: 10 }, name)).toThrow(err)
    })

    it('should not throw error when val is an array', () => {
      expect(assertions.assertArray.bind(null, ['c1', 'c2'], name)).not.toThrow()
    })
  })
})
