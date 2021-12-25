const _ = require('lodash')
const should = require('should')
const HttpZError = require('../src/error')
const utils = require('../src/utils')

describe('utils', () => {
  describe('splitByDelimeter', () => {
    const delimiter = ';'

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
      let actual = utils.splitByDelimeter('somestring  ;  ', delimiter)
      should(actual).eql(['somestring', ''])

      actual = utils.splitByDelimeter('  ;  somestring', delimiter)
      should(actual).eql(['', 'somestring'])
    })

    it('should return array of two elements when str contains two parts', () => {
      let actual = utils.splitByDelimeter('partOne; partTwo', delimiter)
      should(actual).eql(['partOne', 'partTwo'])

      actual = utils.splitByDelimeter('partOne  ;  partTwo   ', delimiter)
      should(actual).eql(['partOne', 'partTwo'])

      actual = utils.splitByDelimeter('partOne; partTwo partThree', delimiter)
      should(actual).eql(['partOne', 'partTwo partThree'])
    })
  })

  describe('isAbsoluteUrl', () => {
    function test(url, expected) {
      let actual = utils.isAbsoluteUrl(url)
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
      return _.extend(
        {
          protocol: 'HTTP',
          host: 'example.com',
          path: '/',
          params: []
        },
        ex
      )
    }

    function test(url, host, expected) {
      let actual = utils.parseUrl(url, host)
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
          getDefParsedUrl({ path: '/home', params: [{ name: 'p1', value: 'v1' }] })
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
          getDefParsedUrl({ path: '/home', params: [{ name: 'p1', value: 'v1' }] })
        )
      })
    })
  })

  describe('generateUrl', () => {
    function test(protocol, host, port, path, params, expected) {
      let actual = utils.generateUrl(protocol, host, port, path, params)
      should(actual).eql(expected)
    }

    it('should generate url without host', () => {
      test(null, null, null, '/features', null, '/features')
    })

    it('should generate url with host', () => {
      test('http', 'example.com', null, '/features', null, 'http://example.com/features')
    })

    it('should generate url with host and port', () => {
      test('http', 'example.com', 8080, '/features', null, 'http://example.com:8080/features')
    })
  })

  describe('generatePath', () => {
    function test(path, params, expected) {
      let actual = utils.generatePath(path, params)
      should(actual).eql(expected)
    }

    it('should generate path without params', () => {
      test('/features', null, '/features')
    })

    it('should generate path with two simple parameters', () => {
      test(
        '/features',
        [
          { name: 'p1', value: 'v1' },
          { name: 'p2>', value: 'v2;' }
        ],
        '/features?p1=v1&p2%3E=v2%3B'
      )
    })

    it('should generate path with object parameters', () => {
      test(
        '/features',
        [
          { name: 'p1[x]', value: 'v1' },
          { name: 'p1[y]', value: 'v2' },
          { name: 'p2>', value: 'v2;' }
        ],
        '/features?p1%5Bx%5D=v1&p1%5By%5D=v2&p2%3E=v2%3B'
      )
    })

    it('should generate path with array parameters', () => {
      test(
        '/features',
        [
          { name: 'p1[]', value: 'v1' },
          { name: 'p1[]', value: 'v2' },
          { name: 'p2>', value: 'v2;' }
        ],
        '/features?p1%5B%5D=v1&p1%5B%5D=v2&p2%3E=v2%3B'
      )
    })
  })

  describe('convertParamsArrayToPairs', () => {
    function test(params, expected) {
      let actual = utils.convertParamsArrayToPairs(params)
      should(actual).eql(expected)
    }

    it('should throw error when params is nil', () => {
      let expected = HttpZError.get('params is required')

      should(utils.convertParamsArrayToPairs.bind(null)).throw(HttpZError, expected)
    })

    it('should throw error when params is not array', () => {
      let params = 'params'
      let expected = HttpZError.get('params must be an array')

      should(utils.convertParamsArrayToPairs.bind(null, params)).throw(HttpZError, expected)
    })

    it('should return param pairs', () => {
      test(
        [{ name: 'p1', value: 'v1' }, { name: 'p2', value: null }, { name: 'p3' }],
        [
          ['p1', 'v1'],
          ['p2', null],
          ['p3', '']
        ]
      )
    })
  })

  describe('pretifyHeaderName', () => {
    function test(name, expected) {
      let actual = utils.pretifyHeaderName(name)
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
      let actual = utils.getEmptyStringForUndefined(val)
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
      return _.extend(
        {
          name: 'John'
        },
        ex
      )
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
