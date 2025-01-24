const should = require('should')
const utils = require('../src/utils')

describe('utils', () => {
  describe('splitBy', () => {
    const delimiter = ';'

    it('should return empty array when str is nil or empty', () => {
      let actual = utils.splitBy(undefined, delimiter)
      should(actual).eql([])

      actual = utils.splitBy(null, delimiter)
      should(actual).eql([])

      actual = utils.splitBy('', delimiter)
      should(actual).eql([])
    })

    it('should return empty array when str does not contain delimiter', () => {
      let actual = utils.splitBy('somestring', delimiter)
      should(actual).eql([])

      actual = utils.splitBy('1234567890', delimiter)
      should(actual).eql([])
    })

    it('should return empty array with one empty element when str does not contain two parts', () => {
      let actual = utils.splitBy('somestring  ;  ', delimiter)
      should(actual).eql(['somestring', ''])

      actual = utils.splitBy('  ;  somestring', delimiter)
      should(actual).eql(['', 'somestring'])
    })

    it('should return array of two elements when str contains two parts', () => {
      let actual = utils.splitBy('partOne; partTwo', delimiter)
      should(actual).eql(['partOne', 'partTwo'])

      actual = utils.splitBy('partOne  ;  partTwo   ', delimiter)
      should(actual).eql(['partOne', 'partTwo'])

      actual = utils.splitBy('partOne; partTwo partThree', delimiter)
      should(actual).eql(['partOne', 'partTwo partThree'])
    })
  })

  describe('isAbsoluteUrl', () => {
    function test(url, expected) {
      const actual = utils.isAbsoluteUrl(url)
      should(actual).eql(expected)
    }

    it('should return false when url is in origin-form', () => {
      test('/api/users', false)
    })

    it('should return false when url is in Windos path', () => {
      test('C:\\files', false)
    })

    it('should return true when url is in absolute-form', () => {
      test('https://example.com/users', true)
    })
  })

  describe('parseUrl', () => {
    function getDefParsedUrl(ex) {
      return {
        protocol: 'HTTP',
        host: 'example.com',
        path: '/',
        params: [],
        ...ex,
      }
    }

    function test(url, host, expected) {
      const actual = utils.parseUrl(url, host)
      should(actual).eql(expected)
    }

    describe('call with one parameter', () => {
      it('should parse url started with http', () => {
        test('http://example.com', undefined, getDefParsedUrl())
      })

      it('should parse url started with https', () => {
        test('https://example.com', undefined, getDefParsedUrl({ protocol: 'HTTPS' }))
      })

      it('should add `http` when url is without protocol', () => {
        test('example.com', undefined, getDefParsedUrl({ protocol: 'HTTP' }))
      })

      it('should parse url with path', () => {
        test('http://example.com/home', undefined, getDefParsedUrl({ path: '/home' }))
      })

      it('should parse url with path and params', () => {
        test(
          'http://example.com/home?p1=v1',
          undefined,
          getDefParsedUrl({ path: '/home', params: [{ name: 'p1', value: 'v1' }] }),
        )
      })
    })

    describe('call with two parameters', () => {
      it('should parse url started with http', () => {
        test('/', 'http://example.com', getDefParsedUrl())
      })

      it('should parse url started with https', () => {
        test('/', 'https://example.com', getDefParsedUrl({ protocol: 'HTTPS' }))
      })

      it('should add `http` when url is without protocol', () => {
        test('/', 'example.com', getDefParsedUrl({ protocol: 'HTTP' }))
      })

      it('should parse url with path', () => {
        test('/home', 'http://example.com', getDefParsedUrl({ path: '/home' }))
      })

      it('should parse url with path and params', () => {
        test(
          '/home?p1=v1',
          'http://example.com',
          getDefParsedUrl({ path: '/home', params: [{ name: 'p1', value: 'v1' }] }),
        )
      })
    })
  })

  describe('arrayToPairs', () => {
    function test(params, expected) {
      const actual = utils.arrayToPairs(params)
      should(actual).eql(expected)
    }

    it('should return param pairs', () => {
      test(
        [{ name: 'p1', value: 'v1' }, { name: 'p2', value: null }, { name: 'p3' }],
        [
          ['p1', 'v1'],
          ['p2', null],
          ['p3', ''],
        ],
      )
    })
  })

  describe('prettifyHeaderName', () => {
    function test(name, expected) {
      const actual = utils.prettifyHeaderName(name)
      should(actual).eql(expected)
    }

    it('should return empty string when name is nil', () => {
      test(undefined, '')
      test(null, '')
    })

    it('should return name as is when it does not contain "-" and is already capitalized', () => {
      test('Cookie', 'Cookie')
    })

    it('should return capitalized name when it does not contain "-" and is not capitalized', () => {
      test('cookie', 'Cookie')
    })

    it('should return name with two capitalized parts when it contains two "-"', () => {
      test('set-cookie', 'Set-Cookie')
    })

    it('should return name with three capitalized parts when it contains three "-"', () => {
      test('x-Server-version', 'X-Server-Version')
    })
  })

  describe('getEmptyStringForUndefined', () => {
    function test(val, expected) {
      const actual = utils.getEmptyStringForUndefined(val)
      should(actual).eql(expected)
    }

    it('should return empty string when val is undefined', () => {
      test(undefined, '')
    })

    it('should return string as is when string is not undefined', () => {
      test('Cookie', 'Cookie')
    })
  })

  describe('extendIfNotUndefined', () => {
    function getDefObject(ex) {
      return {
        name: 'John',
        ...ex,
      }
    }

    function test(fieldName, fieldValue, expected) {
      const obj = getDefObject()
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
