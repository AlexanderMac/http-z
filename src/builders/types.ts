import { HttpMethod, HttpProtocolVersion } from '../constants'
import { HttpZHeader, HttpZBody, HttpZParam } from '../types'

export type HttpZBuilderOptions = {
  mandatoryHost?: boolean
}

export type HttpZBuilderModel = {
  headers: HttpZHeader[]
  body?: HttpZBody
}

export type HttpZBuilderRequestModel = HttpZBuilderModel & {
  method: HttpMethod
  target: string
  protocolVersion: HttpProtocolVersion
  queryParams?: HttpZParam[]
  cookies?: HttpZParam[]
}

export type HttpZBuilderResponseModel = HttpZBuilderModel & {
  protocolVersion: HttpProtocolVersion
  statusCode: number
  statusMessage: string
}
