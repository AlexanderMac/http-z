import { HttpZError } from '../error'
import { isNil, isPlainObject } from '../utils'
import { HttpZRequestBuilder } from './request'
import { HttpZResponseBuilder } from './response'
import { HttpZBuilderModel, HttpZBuilderRequestModel, HttpZBuilderResponseModel, HttpZBuilderOptions } from './types'

export function build(messageModel: HttpZBuilderModel, opts: HttpZBuilderOptions = {}): string | never {
  if (isNil(messageModel)) {
    throw HttpZError.get('messageModel is required')
  }
  if (!isPlainObject(messageModel)) {
    throw HttpZError.get('messageModel must be a plain object')
  }
  if ('method' in messageModel) {
    return HttpZRequestBuilder.build(<HttpZBuilderRequestModel>messageModel, opts)
  }
  if ('statusCode' in messageModel) {
    return HttpZResponseBuilder.build(<HttpZBuilderResponseModel>messageModel)
  }
  throw HttpZError.get('messageModel has incorrect format')
}
