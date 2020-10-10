const should = require('should');
const HttpZError = require('../src/error');
const validators = require('../src/validators');

describe('validators', () => {
  describe('validateRequired', () => {
    let name = 'username';

    it('should throw error when val is nil (undefined, null)', () => {
      should(validators.validateRequired.bind(null, undefined, name)).throw(HttpZError, {
        message: 'username is required'
      });

      should(validators.validateRequired.bind(null, null, name)).throw(HttpZError, {
        message: 'username is required'
      });
    });

    it('should not throw error when val is not nil', () => {
      should(validators.validateRequired.bind(null, 'smith', name)).not.throw(HttpZError);
    });
  });

  describe('validateString', () => {
    let name = 'username';

    it('should throw error when val is not a string (number, date, object)', () => {
      should(validators.validateString.bind(null, 10, name)).throw(HttpZError, {
        message: 'username must be a string'
      });

      should(validators.validateString.bind(null, new Date(), name)).throw(HttpZError, {
        message: 'username must be a string'
      });

      should(validators.validateString.bind(null, { val: 10 }, name)).throw(HttpZError, {
        message: 'username must be a string'
      });
    });
  });

  describe('validateNotEmptyString', () => {
    let name = 'username';

    it('should throw error when val is nil (undefined, null)', () => {
      should(validators.validateNotEmptyString.bind(null, undefined, name)).throw(HttpZError, {
        message: 'username is required'
      });

      should(validators.validateNotEmptyString.bind(null, null, name)).throw(HttpZError, {
        message: 'username is required'
      });
    });

    it('should throw error when val is not a string (number, date, object)', () => {
      should(validators.validateNotEmptyString.bind(null, 10, name)).throw(HttpZError, {
        message: 'username must be a string'
      });

      should(validators.validateNotEmptyString.bind(null, new Date(), name)).throw(HttpZError, {
        message: 'username must be a string'
      });

      should(validators.validateNotEmptyString.bind(null, { val: 10 }, name)).throw(HttpZError, {
        message: 'username must be a string'
      });
    });

    it('should throw error when val is an empty string', () => {
      should(validators.validateNotEmptyString.bind(null, '', name)).throw(HttpZError, {
        message: 'username must be not empty string'
      });
    });

    it('should not throw error when val is not empty string', () => {
      should(validators.validateNotEmptyString.bind(null, 'smith', name)).not.throw(HttpZError);
    });
  });

  describe('validateNumber', () => {
    let name = 'age';

    it('should throw error when val is nil (undefined, null)', () => {
      should(validators.validateNumber.bind(null, undefined, name)).throw(HttpZError, {
        message: 'age is required'
      });

      should(validators.validateNumber.bind(null, null, name)).throw(HttpZError, {
        message: 'age is required'
      });
    });

    it('should throw error when val is not a number (string, date, object)', () => {
      should(validators.validateNumber.bind(null, '10', name)).throw(HttpZError, {
        message: 'age must be a number'
      });

      should(validators.validateNumber.bind(null, new Date(), name)).throw(HttpZError, {
        message: 'age must be a number'
      });

      should(validators.validateNumber.bind(null, { val: 10 }, name)).throw(HttpZError, {
        message: 'age must be a number'
      });
    });

    it('should not throw error when val is a number', () => {
      should(validators.validateNumber.bind(null, -10, name)).not.throw(HttpZError);
      should(validators.validateNumber.bind(null, 25, name)).not.throw(HttpZError);
    });
  });

  describe('validatePositiveNumber', () => {
    let name = 'age';

    it('should throw error when val is nil (undefined, null)', () => {
      should(validators.validatePositiveNumber.bind(null, undefined, name)).throw(HttpZError, {
        message: 'age is required'
      });

      should(validators.validatePositiveNumber.bind(null, null, name)).throw(HttpZError, {
        message: 'age is required'
      });
    });

    it('should throw error when val is not a number (string, date, object)', () => {
      should(validators.validatePositiveNumber.bind(null, '10', name)).throw(HttpZError, {
        message: 'age must be a number'
      });

      should(validators.validatePositiveNumber.bind(null, new Date(), name)).throw(HttpZError, {
        message: 'age must be a number'
      });

      should(validators.validatePositiveNumber.bind(null, { val: 10 }, name)).throw(HttpZError, {
        message: 'age must be a number'
      });
    });

    it('should throw error when val is less or equal to zero', () => {
      should(validators.validatePositiveNumber.bind(null, -5, name)).throw(HttpZError, {
        message: 'age must be a positive number'
      });

      should(validators.validatePositiveNumber.bind(null, 0, name)).throw(HttpZError, {
        message: 'age must be a positive number'
      });
    });

    it('should not throw error when val is a positive number', () => {
      should(validators.validatePositiveNumber.bind(null, 25, name)).not.throw(HttpZError);
    });
  });

  describe('validateArray', () => {
    let name = 'cookies';

    it('should throw error when val is nil (undefined, null)', () => {
      should(validators.validateArray.bind(null, undefined, name)).throw(HttpZError, {
        message: 'cookies is required'
      });

      should(validators.validateArray.bind(null, null, name)).throw(HttpZError, {
        message: 'cookies is required'
      });
    });

    it('should throw error when val is not an array (string, number, date, object)', () => {
      should(validators.validateArray.bind(null, '10', name)).throw(HttpZError, {
        message: 'cookies must be an array'
      });

      should(validators.validateArray.bind(null, 10, name)).throw(HttpZError, {
        message: 'cookies must be an array'
      });

      should(validators.validateArray.bind(null, new Date(), name)).throw(HttpZError, {
        message: 'cookies must be an array'
      });

      should(validators.validateArray.bind(null, { val: 10 }, name)).throw(HttpZError, {
        message: 'cookies must be an array'
      });
    });

    it('should not throw error when val is an array', () => {
      should(validators.validateArray.bind(null, ['c1', 'c2'], name)).not.throw(HttpZError);
    });
  });
});
