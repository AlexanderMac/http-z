import { HttpZParam } from '../src/types'
import * as utils from '../src/utils'

describe('utils', () => {
  describe('splitBy', () => {
    const delimiter = ';'

    it('should return empty array when str is nil or empty', () => {
      let actual = utils.splitBy(undefined as any, delimiter)
      expect(actual).toEqual([])

      actual = utils.splitBy(null as any, delimiter)
      expect(actual).toEqual([])

      actual = utils.splitBy('', delimiter)
      expect(actual).toEqual([])
    })

    it('should return empty array when str does not contain delimiter', () => {
      let actual = utils.splitBy('somestring', delimiter)
      expect(actual).toEqual([])

      actual = utils.splitBy('1234567890', delimiter)
      expect(actual).toEqual([])
    })

    it('should return empty array with one empty element when str does not contain two parts', () => {
      let actual = utils.splitBy('somestring  ;  ', delimiter)
      expect(actual).toEqual(['somestring', ''])

      actual = utils.splitBy('  ;  somestring', delimiter)
      expect(actual).toEqual(['', 'somestring'])
    })

    it('should return array of two elements when str contains two parts', () => {
      let actual = utils.splitBy('partOne; partTwo', delimiter)
      expect(actual).toEqual(['partOne', 'partTwo'])

      actual = utils.splitBy('partOne  ;  partTwo   ', delimiter)
      expect(actual).toEqual(['partOne', 'partTwo'])

      actual = utils.splitBy('partOne; partTwo partThree', delimiter)
      expect(actual).toEqual(['partOne', 'partTwo partThree'])
    })
  })

  describe('isAbsoluteUrl', () => {
    function test(url: string, expected: unknown): void {
      const actual = utils.isAbsoluteUrl(url)
      expect(actual).toEqual(expected)
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
    function getDefParsedUrl(ex = {}): object {
      return {
        protocol: 'HTTP',
        host: 'example.com',
        path: '/',
        params: [],
        ...ex,
      }
    }

    function test(url: string, host: string, expected: unknown): void {
      const actual = utils.parseUrl(url, host)
      expect(actual).toEqual(expected)
    }

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

  describe('arrayToPairs', () => {
    function test(params: HttpZParam[], expected: unknown): void {
      const actual = utils.arrayToPairs(params)
      expect(actual).toEqual(expected)
    }

    it('should return param pairs', () => {
      test(
        [{ name: 'p1', value: 'v1' }, { name: 'p2', value: undefined }, { name: 'p3' }],
        [
          ['p1', 'v1'],
          ['p2', ''],
          ['p3', ''],
        ],
      )
    })
  })

  describe('prettifyHeaderName', () => {
    function test(name: string | null | undefined, expected: unknown): void {
      const actual = utils.prettifyHeaderName(name)
      expect(actual).toEqual(expected)
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
    function test(val: string | undefined, expected: unknown): void {
      const actual = utils.getEmptyStringForUndefined(val)
      expect(actual).toEqual(expected)
    }

    it('should return empty string when val is undefined', () => {
      test(undefined, '')
    })

    it('should return string as is when string is not undefined', () => {
      test('Cookie', 'Cookie')
    })
  })

  describe('extendIfNotUndefined', () => {
    function getDefObject(ex = {}): object {
      return {
        name: 'John',
        ...ex,
      }
    }

    function test(fieldName: string, fieldValue: string | undefined, expected: unknown): void {
      const obj = getDefObject()
      utils.extendIfNotUndefined(obj, fieldName, fieldValue)
      expect(obj).toEqual(expected)
    }

    it('should not extend object by new field when fieldValue is undefined', () => {
      test('login', undefined, getDefObject())
    })

    it('should extend object by new field when fieldValue is not undefined', () => {
      test('login', 'smith', getDefObject({ login: 'smith' }))
    })
  })
})
