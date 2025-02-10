import { assertNotEmptyString, assertPositiveNumber } from '../assertions'
import { EOL, HttpProtocolVersion } from '../constants'
import { HttpZBaseBuilder } from './base'
import { HttpZBuilderResponseModel } from './types'

export class HttpZResponseBuilder extends HttpZBaseBuilder {
  static build(...params: ConstructorParameters<typeof HttpZResponseBuilder>): string {
    const instance = new HttpZResponseBuilder(...params)
    return instance.build()
  }

  private readonly protocolVersion: HttpProtocolVersion
  private readonly statusCode: number
  private readonly statusMessage: string

  constructor(message: HttpZBuilderResponseModel) {
    super(message.headers, message.body)
    this.protocolVersion = message.protocolVersion
    this.statusCode = message.statusCode
    this.statusMessage = message.statusMessage
  }

  build(): string {
    return '' + this._generateStartRow() + this._generateHeaderRows() + EOL + this._generateBodyRows()
  }

  private _generateStartRow(): string {
    assertNotEmptyString(this.protocolVersion, 'protocolVersion')
    assertPositiveNumber(this.statusCode, 'statusCode')
    assertNotEmptyString(this.statusMessage, 'statusMessage')

    const protocolVersion = this.protocolVersion.toUpperCase()
    return `${protocolVersion} ${this.statusCode} ${this.statusMessage}` + EOL
  }
}
