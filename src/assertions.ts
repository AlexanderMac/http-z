import { HttpZError } from './error'
import { isNil, isString, isEmpty, isNumber, isArray } from './utils'

export const assertRequired = (val: unknown, field: string, details?: string): void | never => {
  if (isNil(val)) {
    throw HttpZError.get(`${field} is required`, details)
  }
}

export const assertString = (val: unknown, field: string, details?: string): void | never => {
  assertRequired(val, field, details)
  if (!isString(val)) {
    throw HttpZError.get(`${field} must be a string`, details)
  }
}

export const assertNotEmptyString = (val: unknown, field: string, details?: string): void | never => {
  assertString(val, field, details)
  if (isEmpty(val)) {
    throw HttpZError.get(`${field} must be not empty string`, details)
  }
}

export const assertNumber = (val: unknown, field: string, details?: string): void | never => {
  assertRequired(val, field, details)
  if (!isNumber(val)) {
    throw HttpZError.get(`${field} must be a number`, details)
  }
}

export const assertPositiveNumber = (val: unknown, field: string, details?: string): void | never => {
  assertNumber(val, field, details)
  if (<number>val <= 0) {
    throw HttpZError.get(`${field} must be a positive number`, details)
  }
}

export const assertArray = (val: unknown, field: string, details?: string): void | never => {
  assertRequired(val, field, details)
  if (!isArray(val)) {
    throw HttpZError.get(`${field} must be an array`, details)
  }
}
