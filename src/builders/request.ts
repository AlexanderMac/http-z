import { assertArray, assertNotEmptyString } from '../assertions'
import { EOL, HttpHeader, HttpMethod, HttpProtocolVersion } from '../constants'
import { HttpZError } from '../error'
import { HttpZHeader } from '../types'
import { prettifyHeaderName } from '../utils'
import { HttpZBaseBuilder } from './base'
import { HttpZBuilderOptions, HttpZBuilderRequestModel } from './types'

export class HttpZRequestBuilder extends HttpZBaseBuilder {
  static build(...params: ConstructorParameters<typeof HttpZRequestBuilder>): string {
    const instance = new HttpZRequestBuilder(...params)
    return instance.build()
  }

  private readonly method: HttpMethod
  private readonly protocolVersion: HttpProtocolVersion
  private readonly target: string
  private readonly opts: HttpZBuilderOptions

  constructor(message: HttpZBuilderRequestModel, opts: HttpZBuilderOptions) {
    super(message.headers, message.body)
    this.method = message.method
    this.protocolVersion = message.protocolVersion
    this.target = message.target
    this.opts = opts
  }

  build(): string {
    return '' + this._generateStartRow() + this._generateHeaderRows() + EOL + this._generateBodyRows()
  }

  private _generateStartRow(): string {
    assertNotEmptyString(this.method, 'method')
    assertNotEmptyString(this.protocolVersion, 'protocolVersion')
    assertNotEmptyString(this.target, 'target')

    return '' + this.method.toUpperCase() + ' ' + this.target + ' ' + this.protocolVersion.toUpperCase() + EOL
  }

  protected override _generateHeaderRows(): string {
    assertArray(this.headers, 'headers')

    if (this.opts.mandatoryHost) {
      const hostHeader = this.headers.find(
        (h: HttpZHeader) => prettifyHeaderName(h.name) === HttpHeader.host.toString(),
      )
      if (!hostHeader) {
        throw HttpZError.get('Host header is required')
      }
    }

    return super._generateHeaderRows()
  }
}
