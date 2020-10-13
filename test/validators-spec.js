const should = require('should')
const HttpZError = require('../src/error')
const validators = require('../src/validators')

describe('validators', () => {
  function validateRequired(fn, name) {
    it('should throw error when val is nil (undefined, null)', () => {
      const ERR = {
        message: `${name} is required`
      }
      should(fn.bind(null, undefined, name)).throw(HttpZError, ERR)
      should(fn.bind(null, null, name)).throw(HttpZError, ERR)
    })
  }

  function validateString(fn, name) {
    it('should throw error when val is not a string (number, date, object, array)', () => {
      const ERR = {
        message: 'username must be a string'
      }
      should(fn.bind(null, 10, name)).throw(HttpZError, ERR)
      should(fn.bind(null, new Date(), name)).throw(HttpZError, ERR)
      should(fn.bind(null, { val: 10 }, name)).throw(HttpZError, ERR)
      should(fn.bind(null, [10, 20], name)).throw(HttpZError, ERR)
    })
  }

  function validateNumber(fn, name) {
    it('should throw error when val is not a number (string, date, object, array)', () => {
      const ERR = {
        message: 'age must be a number'
      }
      should(fn.bind(null, '10', name)).throw(HttpZError, ERR)
      should(fn.bind(null, new Date(), name)).throw(HttpZError, ERR)
      should(fn.bind(null, { val: 10 }, name)).throw(HttpZError, ERR)
      should(fn.bind(null, [10, 20], name)).throw(HttpZError, ERR)
    })
  }

  describe('validateRequired', () => {
    let name = 'username'

    validateRequired(validators.validateRequired, name)

    it('should not throw error when val is not nil', () => {
      should(validators.validateRequired.bind(null, 'smith', name)).not.throw(HttpZError)
    })
  })

  describe('validateString', () => {
    let name = 'username'

    validateRequired(validators.validateString, name)
    validateString(validators.validateString, name)
  })

  describe('validateNotEmptyString', () => {
    let name = 'username'

    validateRequired(validators.validateNotEmptyString, name)
    validateString(validators.validateNotEmptyString, name)

    it('should throw error when val is an empty string', () => {
      should(validators.validateNotEmptyString.bind(null, '', name)).throw(HttpZError, {
        message: 'username must be not empty string'
      })
    })

    it('should not throw error when val is not empty string', () => {
      should(validators.validateNotEmptyString.bind(null, 'smith', name)).not.throw(HttpZError)
    })
  })

  describe('validateNumber', () => {
    let name = 'age'

    validateRequired(validators.validateNumber, name)
    validateNumber(validators.validateNumber, name)

    it('should not throw error when val is a number', () => {
      should(validators.validateNumber.bind(null, -10, name)).not.throw(HttpZError)
      should(validators.validateNumber.bind(null, 25, name)).not.throw(HttpZError)
    })
  })

  describe('validatePositiveNumber', () => {
    let name = 'age'

    validateRequired(validators.validatePositiveNumber, name)
    validateNumber(validators.validatePositiveNumber, name)

    it('should throw error when val is less or equal to zero', () => {
      should(validators.validatePositiveNumber.bind(null, -5, name)).throw(HttpZError, {
        message: 'age must be a positive number'
      })
      should(validators.validatePositiveNumber.bind(null, 0, name)).throw(HttpZError, {
        message: 'age must be a positive number'
      })
    })

    it('should not throw error when val is a positive number', () => {
      should(validators.validatePositiveNumber.bind(null, 25, name)).not.throw(HttpZError)
    })
  })

  describe('validateArray', () => {
    let name = 'cookies'

    validateRequired(validators.validateArray, name)

    it('should throw error when val is not an array (string, number, date, object)', () => {
      const ERR = {
        message: 'cookies must be an array'
      }
      should(validators.validateArray.bind(null, '10', name)).throw(HttpZError, ERR)
      should(validators.validateArray.bind(null, 10, name)).throw(HttpZError, ERR)
      should(validators.validateArray.bind(null, new Date(), name)).throw(HttpZError, ERR)
      should(validators.validateArray.bind(null, { val: 10 }, name)).throw(HttpZError, ERR)
    })

    it('should not throw error when val is an array', () => {
      should(validators.validateArray.bind(null, ['c1', 'c2'], name)).not.throw(HttpZError)
    })
  })
})
