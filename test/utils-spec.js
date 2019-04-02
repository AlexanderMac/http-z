'use strict';

const should = require('should');
const utils  = require('../src/utils');

describe('utils', () => {
  describe('splitIntoTwoParts', () => {
    const delimiter = ' ';

    it('should return empty array when str is nil or empty', () => {
      let actual = utils.splitIntoTwoParts(undefined, delimiter);
      should(actual).eql([]);

      actual = utils.splitIntoTwoParts(null, delimiter);
      should(actual).eql([]);

      actual = utils.splitIntoTwoParts('', delimiter);
      should(actual).eql([]);
    });

    it('should return empty array when str does not contain delimiter', () => {
      let actual = utils.splitIntoTwoParts('somestring', delimiter);
      should(actual).eql([]);

      actual = utils.splitIntoTwoParts('1234567890', delimiter);
      should(actual).eql([]);
    });

    it('should return empty array with one empty element when str does not contain two parts', () => {
      let actual = utils.splitIntoTwoParts('somestring    ', delimiter);
      should(actual).eql(['somestring', '']);

      actual = utils.splitIntoTwoParts('    somestring', delimiter);
      should(actual).eql(['', 'somestring']);
    });

    it('should return array of two elems when str contains two parts', () => {
      let actual = utils.splitIntoTwoParts('partOne partTwo', delimiter);
      should(actual).eql(['partOne', 'partTwo']);

      actual = utils.splitIntoTwoParts('partOne    partTwo   ', delimiter);
      should(actual).eql(['partOne', 'partTwo']);

      actual = utils.splitIntoTwoParts('partOne partTwo partThree', delimiter);
      should(actual).eql(['partOne', 'partTwo partThree']);
    });
  });

  describe('validateNotEmptyString', () => {
    let name = 'username';

    it('should throw error when val is nil (undefined, null, empty)', () => {
      should(utils.validateNotEmptyString.bind(null, undefined, name)).throw(Error, {
        message: 'username must be not empty string'
      });

      should(utils.validateNotEmptyString.bind(null, null, name)).throw(Error, {
        message: 'username must be not empty string'
      });

      should(utils.validateNotEmptyString.bind(null, '', name)).throw(Error, {
        message: 'username must be not empty string'
      });
    });

    it('should throw error when val is not a string (number, date, object)', () => {
      should(utils.validateNotEmptyString.bind(null, 10, name)).throw(Error, {
        message: 'username must be not empty string'
      });

      should(utils.validateNotEmptyString.bind(null, new Date(), name)).throw(Error, {
        message: 'username must be not empty string'
      });

      should(utils.validateNotEmptyString.bind(null, { val: 10 }, name)).throw(Error, {
        message: 'username must be not empty string'
      });
    });

    it('should not throw error when val is not empty string', () => {
      should(utils.validateNotEmptyString.bind(null, 'smith', name)).not.throw(Error);
    });
  });

  describe('validateNotZeroOrNegativeNumber', () => {
    let name = 'age';

    it('should throw error when val is nil (undefined, null, empty)', () => {
      should(utils.validateNotZeroOrNegativeNumber.bind(null, undefined, name)).throw(Error, {
        message: 'age must be not zero, positive number'
      });

      should(utils.validateNotZeroOrNegativeNumber.bind(null, null, name)).throw(Error, {
        message: 'age must be not zero, positive number'
      });

      should(utils.validateNotZeroOrNegativeNumber.bind(null, '', name)).throw(Error, {
        message: 'age must be not zero, positive number'
      });
    });

    it('should throw error when val is not a number (string, date, object)', () => {
      should(utils.validateNotZeroOrNegativeNumber.bind(null, '10', name)).throw(Error, {
        message: 'age must be not zero, positive number'
      });

      should(utils.validateNotZeroOrNegativeNumber.bind(null, new Date(), name)).throw(Error, {
        message: 'age must be not zero, positive number'
      });

      should(utils.validateNotZeroOrNegativeNumber.bind(null, { val: 10 }, name)).throw(Error, {
        message: 'age must be not zero, positive number'
      });
    });

    it('should throw error when val is less or equal to zero', () => {
      should(utils.validateNotZeroOrNegativeNumber.bind(null, -5, name)).throw(Error, {
        message: 'age must be not zero, positive number'
      });

      should(utils.validateNotZeroOrNegativeNumber.bind(null, 0, name)).throw(Error, {
        message: 'age must be not zero, positive number'
      });
    });

    it('should not throw error when val is a positive number', () => {
      should(utils.validateNotZeroOrNegativeNumber.bind(null, 25, name)).not.throw(Error);
    });
  });

  describe('generateUrl', () => {
    function test({ params, expected }) {
      let actual = utils.generateUrl(params);
      should(actual).eql(expected);
    }

    it('should generate url', () => {
      let params = {
        protocol: 'http',
        host: 'example.com',
        path: '/features'
      };
      let expected = 'http://example.com/features';

      test({ params, expected });
    });

    it('should generate url with basic auth', () => {
      let params = {
        protocol: 'http',
        host: 'example.com',
        path: '/features',
        basicAuth: {
          username: 'smith',
          password: 12345
        }
      };
      let expected = 'http://smith:12345@example.com/features';

      test({ params, expected });
    });

    it('should generate url with params', () => {
      let params = {
        protocol: 'http',
        host: 'example.com',
        path: '/features',
        params: {
          p1: 'v1',
          p2: null
        }
      };
      let expected = 'http://example.com/features?p1=v1&p2=null';

      test({ params, expected });
    });
  });

  describe('getHeaderName', () => {
    function test(name, expected) {
      let actual = utils.getHeaderName(name);
      should(actual).eql(expected);
    }

    it('should return empty string when name is null', () => {
      test(null, '');
    });

    it('should return name as is when it does not contain elements', () => {
      test('Cookie', 'Cookie');
    });

    it('should return capitalized name when it does not contain elements', () => {
      test('cookie', 'Cookie');
    });

    it('should return capitalized name when it contain two elements', () => {
      test('set-cookie', 'Set-Cookie');
    });

    it('should return capitalized name when it contain three elements', () => {
      test('x-Server-version', 'X-Server-Version');
    });
  });
});
