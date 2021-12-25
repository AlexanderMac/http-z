const _ = require('lodash')
const HttpZError = require('./error')

exports.validateRequired = (val, field, details) => {
  if (_.isNil(val)) {
    throw HttpZError.get(`${field} is required`, details)
  }
}

exports.validateString = (val, field, details) => {
  exports.validateRequired(val, field, details)
  if (!_.isString(val)) {
    throw HttpZError.get(`${field} must be a string`, details)
  }
}

exports.validateNotEmptyString = (val, field, details) => {
  exports.validateString(val, field, details)
  if (_.isEmpty(val)) {
    throw HttpZError.get(`${field} must be not empty string`, details)
  }
}

exports.validateNumber = (val, field, details) => {
  exports.validateRequired(val, field, details)
  if (!_.isNumber(val)) {
    throw HttpZError.get(`${field} must be a number`, details)
  }
}

exports.validatePositiveNumber = (val, field, details) => {
  exports.validateNumber(val, field, details)
  if (val <= 0) {
    throw HttpZError.get(`${field} must be a positive number`, details)
  }
}

exports.validateArray = (val, field, details) => {
  exports.validateRequired(val, field, details)
  if (!_.isArray(val)) {
    throw HttpZError.get(`${field} must be an array`, details)
  }
}
