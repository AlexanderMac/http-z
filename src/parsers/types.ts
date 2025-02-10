import { HttpMethod, HttpProtocolVersion } from '../constants'
import { HttpZHeader, HttpZBody, HttpZParam, HttpZCookieParam } from '../types'

export type HttpZParserOptions = {
  mandatoryHost?: boolean
}

export type HttpZParserModel = {
  headers: HttpZHeader[]
  body?: HttpZBody
  headersSize?: number
  bodySize?: number
}

export type HttpZParserRequestModel = HttpZParserModel & {
  method: HttpMethod
  target: string
  host: string
  path: string
  protocolVersion: HttpProtocolVersion
  queryParams?: HttpZParam[]
  cookies?: HttpZParam[]
}

export type HttpZParserResponseModel = HttpZParserModel & {
  protocolVersion: HttpProtocolVersion
  statusCode: number
  statusMessage: string
  cookies?: HttpZCookieParam[]
}
