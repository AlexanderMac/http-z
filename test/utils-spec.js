const _ = require('lodash')
const should = require('should')
const utils = require('../src/utils')

describe('utils', () => {
  describe('splitByDelimeter', () => {
    const delimiter = ' '

    it('should return empty array when str is nil or empty', () => {
      let actual = utils.splitByDelimeter(undefined, delimiter)
      should(actual).eql([])

      actual = utils.splitByDelimeter(null, delimiter)
      should(actual).eql([])

      actual = utils.splitByDelimeter('', delimiter)
      should(actual).eql([])
    })

    it('should return empty array when str does not contain delimiter', () => {
      let actual = utils.splitByDelimeter('somestring', delimiter)
      should(actual).eql([])

      actual = utils.splitByDelimeter('1234567890', delimiter)
      should(actual).eql([])
    })

    it('should return empty array with one empty element when str does not contain two parts', () => {
      let actual = utils.splitByDelimeter('somestring    ', delimiter)
      should(actual).eql(['somestring', ''])

      actual = utils.splitByDelimeter('    somestring', delimiter)
      should(actual).eql(['', 'somestring'])
    })

    it('should return array of two elems when str contains two parts', () => {
      let actual = utils.splitByDelimeter('partOne partTwo', delimiter)
      should(actual).eql(['partOne', 'partTwo'])

      actual = utils.splitByDelimeter('partOne    partTwo   ', delimiter)
      should(actual).eql(['partOne', 'partTwo'])

      actual = utils.splitByDelimeter('partOne partTwo partThree', delimiter)
      should(actual).eql(['partOne', 'partTwo partThree'])
    })
  })

  describe('parseUrl', () => {
    function getDefParsedUrl(ex) {
      return _.extend({
        protocol: 'HTTP',
        host: 'example.com',
        path: '/',
        params: []
      }, ex)
    }

    function test(path, origin, expected) {
      let actual = utils.parseUrl(path, origin)
      should(actual).eql(expected)
    }

    describe('call with one parameter', () => {
      it('should parse url started with http', () => {
        test('http://example.com', undefined, getDefParsedUrl())
      })

      it('should parse url started with https', () => {
        test('https://example.com', undefined, getDefParsedUrl({ protocol: 'HTTPS' }))
      })

      it('should add http for url without protocol and parse it', () => {
        test('example.com', undefined, getDefParsedUrl({ protocol: 'HTTP' }))
      })

      it('should parse url with path', () => {
        test('http://example.com/home', undefined, getDefParsedUrl({ path: '/home' }))
      })

      it('should parse url with path and params', () => {
        test('http://example.com/home?p1=v1', undefined, getDefParsedUrl({ path: '/home', params: [{ name: 'p1', value: 'v1' }] }))
      })
    })

    describe('call with two parameters', () => {
      it('should parse url started with http', () => {
        test('/', 'http://example.com', getDefParsedUrl())
      })

      it('should parse url started with https', () => {
        test('/', 'https://example.com', getDefParsedUrl({ protocol: 'HTTPS' }))
      })

      it('should add http for url without protocol and parse it', () => {
        test('/', 'example.com', getDefParsedUrl({ protocol: 'HTTP' }))
      })

      it('should parse url with path', () => {
        test('/home', 'http://example.com', getDefParsedUrl({ path: '/home' }))
      })

      it('should parse url with path and params', () => {
        test('/home?p1=v1', 'http://example.com', getDefParsedUrl({ path: '/home', params: [{ name: 'p1', value: 'v1' }] }))
      })
    })
  })

  describe('generatePath', () => {
    function test(params, expected) {
      let actual = utils.generatePath(params)
      should(actual).eql(expected)
    }

    it('should generate path without params', () => {
      test({
        path: '/features'
      }, '/features')
    })

    it('should generate path with params', () => {
      test({
        path: '/features',
        queryParams: [
          { name: 'p1', value: 'v1' },
          { name: 'p2', value: null },
          { name: 'p3&[', value: 'some &[] "' },
          { name: 'p4' }
        ]
      }, '/features?p1=v1&p2=&p3%26%5B=some%20%26%5B%5D%20%22&p4=')
    })
  })

  describe('pretifyHeaderName', () => {
    function test(name, expected) {
      let actual = utils.pretifyHeaderName(name)
      should(actual).eql(expected)
    }

    it('should return empty string when name is null', () => {
      test(null, '')
    })

    it('should return name as is when it does not contain elements', () => {
      test('Cookie', 'Cookie')
    })

    it('should return capitalized name when it does not contain elements', () => {
      test('cookie', 'Cookie')
    })

    it('should return capitalized name when it contain two elements', () => {
      test('set-cookie', 'Set-Cookie')
    })

    it('should return capitalized name when it contain three elements', () => {
      test('x-Server-version', 'X-Server-Version')
    })
  })

  describe('getEmptyStringForUndefined', () => {
    function test(val, expected) {
      let actual = utils.getEmptyStringForUndefined(val)
      should(actual).eql(expected)
    }

    it('should return empty string when val is undefined', () => {
      test(undefined, '')
    })

    it('should return val when val is not undefined', () => {
      test('Cookie', 'Cookie')
    })
  })

  describe('extendIfNotUndefined', () => {
    function getDefObject(ex) {
      return _.extend({
        name: 'John'
      }, ex)
    }

    function test(fieldName, fieldValue, expected) {
      let obj = getDefObject()
      utils.extendIfNotUndefined(obj, fieldName, fieldValue)
      should(obj).eql(expected)
    }

    it('should not extend object by new field when fieldValue is undefined', () => {
      test('login', undefined, getDefObject())
    })

    it('should extend object by new field when fieldValue is not undefined', () => {
      test('login', 'smith', getDefObject({ login: 'smith' }))
    })
  })
})
