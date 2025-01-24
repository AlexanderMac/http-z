const { isNil, isString, isEmpty, isNumber, isArray } = require('./utils')
const HttpZError = require('./error')

exports.assertRequired = (val, field, details) => {
  if (isNil(val)) {
    throw HttpZError.get(`${field} is required`, details)
  }
}

exports.assertString = (val, field, details) => {
  exports.assertRequired(val, field, details)
  if (!isString(val)) {
    throw HttpZError.get(`${field} must be a string`, details)
  }
}

exports.assertNotEmptyString = (val, field, details) => {
  exports.assertString(val, field, details)
  if (isEmpty(val)) {
    throw HttpZError.get(`${field} must be not empty string`, details)
  }
}

exports.assertNumber = (val, field, details) => {
  exports.assertRequired(val, field, details)
  if (!isNumber(val)) {
    throw HttpZError.get(`${field} must be a number`, details)
  }
}

exports.assertPositiveNumber = (val, field, details) => {
  exports.assertNumber(val, field, details)
  if (val <= 0) {
    throw HttpZError.get(`${field} must be a positive number`, details)
  }
}

exports.assertArray = (val, field, details) => {
  exports.assertRequired(val, field, details)
  if (!isArray(val)) {
    throw HttpZError.get(`${field} must be an array`, details)
  }
}
