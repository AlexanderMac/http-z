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
});
