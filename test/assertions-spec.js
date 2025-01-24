const should = require('should')
const HttpZError = require('../src/error')
const assertions = require('../src/assertions')

describe('assertions', () => {
  function assertRequired(fn, name) {
    it('should throw error when val is nil (undefined, null)', () => {
      const ERR = {
        message: `${name} is required`,
      }
      should(fn.bind(null, undefined, name)).throw(HttpZError, ERR)
      should(fn.bind(null, null, name)).throw(HttpZError, ERR)
    })
  }

  function assertString(fn, name) {
    it('should throw error when val is not a string (number, date, object, array)', () => {
      const ERR = {
        message: 'username must be a string',
      }
      should(fn.bind(null, 10, name)).throw(HttpZError, ERR)
      should(fn.bind(null, new Date(), name)).throw(HttpZError, ERR)
      should(fn.bind(null, { val: 10 }, name)).throw(HttpZError, ERR)
      should(fn.bind(null, [10, 20], name)).throw(HttpZError, ERR)
    })
  }

  function assertNumber(fn, name) {
    it('should throw error when val is not a number (string, date, object, array)', () => {
      const ERR = {
        message: 'age must be a number',
      }
      should(fn.bind(null, '10', name)).throw(HttpZError, ERR)
      should(fn.bind(null, new Date(), name)).throw(HttpZError, ERR)
      should(fn.bind(null, { val: 10 }, name)).throw(HttpZError, ERR)
      should(fn.bind(null, [10, 20], name)).throw(HttpZError, ERR)
    })
  }

  describe('assertRequired', () => {
    const name = 'username'

    assertRequired(assertions.assertRequired, name)

    it('should not throw error when val is not nil', () => {
      should(assertions.assertRequired.bind(null, 'smith', name)).not.throw(HttpZError)
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
      should(assertions.assertNotEmptyString.bind(null, '', name)).throw(HttpZError, {
        message: 'username must be not empty string',
      })
    })

    it('should not throw error when val is not empty string', () => {
      should(assertions.assertNotEmptyString.bind(null, 'smith', name)).not.throw(HttpZError)
    })
  })

  describe('assertNumber', () => {
    const name = 'age'

    assertRequired(assertions.assertNumber, name)
    assertNumber(assertions.assertNumber, name)

    it('should not throw error when val is a number', () => {
      should(assertions.assertNumber.bind(null, -10, name)).not.throw(HttpZError)
      should(assertions.assertNumber.bind(null, 25, name)).not.throw(HttpZError)
    })
  })

  describe('assertPositiveNumber', () => {
    const name = 'age'

    assertRequired(assertions.assertPositiveNumber, name)
    assertNumber(assertions.assertPositiveNumber, name)

    it('should throw error when val is less or equal to zero', () => {
      should(assertions.assertPositiveNumber.bind(null, -5, name)).throw(HttpZError, {
        message: 'age must be a positive number',
      })
      should(assertions.assertPositiveNumber.bind(null, 0, name)).throw(HttpZError, {
        message: 'age must be a positive number',
      })
    })

    it('should not throw error when val is a positive number', () => {
      should(assertions.assertPositiveNumber.bind(null, 25, name)).not.throw(HttpZError)
    })
  })

  describe('assertArray', () => {
    const name = 'cookies'

    assertRequired(assertions.assertArray, name)

    it('should throw error when val is not an array (string, number, date, object)', () => {
      const ERR = {
        message: 'cookies must be an array',
      }
      should(assertions.assertArray.bind(null, '10', name)).throw(HttpZError, ERR)
      should(assertions.assertArray.bind(null, 10, name)).throw(HttpZError, ERR)
      should(assertions.assertArray.bind(null, new Date(), name)).throw(HttpZError, ERR)
      should(assertions.assertArray.bind(null, { val: 10 }, name)).throw(HttpZError, ERR)
    })

    it('should not throw error when val is an array', () => {
      should(assertions.assertArray.bind(null, ['c1', 'c2'], name)).not.throw(HttpZError)
    })
  })
})
