import { assertArray, assertNotEmptyString, assertString } from '../assertions'
import { EOL, HttpContentApplicationType, HttpContentMultipartType, HttpHeader } from '../constants'
import { HttpZBody, HttpZHeader, HttpZParam } from '../types'
import { isEmpty, prettifyHeaderName, getEmptyStringForUndefined, arrayToPairs } from '../utils'

export class HttpZBaseBuilder {
  protected readonly headers: HttpZHeader[]
  protected readonly body: HttpZBody | undefined

  constructor(headers: HttpZHeader[], body: HttpZBody | undefined) {
    this.headers = headers
    this.body = body
  }

  protected _generateHeaderRows(): string {
    assertArray(this.headers, 'headers')

    if (isEmpty(this.headers)) {
      return ''
    }

    const headerRowsStr = this.headers
      .map((header, index) => {
        assertNotEmptyString(header.name, 'header name', `header index: ${index}`)
        assertString(header.value, 'header.value', `header index: ${index}`)

        const headerName = prettifyHeaderName(header.name)
        const headerValue = header.value

        return headerName + ': ' + headerValue
      })
      .join(EOL)

    return headerRowsStr + EOL
  }

  protected _generateBodyRows(): string {
    if (isEmpty(this.body)) {
      return ''
    }

    this._processTransferEncodingChunked()

    switch (this.body!.contentType) {
      case HttpContentMultipartType.formData:
      case HttpContentMultipartType.alternative:
      case HttpContentMultipartType.mixed:
      case HttpContentMultipartType.related:
        return this._generateFormDataBody()
      case HttpContentApplicationType.xWwwFormUrlencoded:
        return this._generateUrlencodedBody()
      default:
        return this._generateTextBody()
    }
  }

  private _processTransferEncodingChunked(): void {
    const isChunked = this.headers.find(
      h => h.name === HttpHeader.transferEncoding.toString() && h.value.includes('chunked'),
    )
    if (!isChunked) {
      return
    }

    const body = getEmptyStringForUndefined(this.body!.text)
    const defChunkLength = 25
    const buffer: string[] = []
    let index = 0
    while (index < body.length) {
      const chunk = body.slice(index, index + defChunkLength)
      buffer.push(chunk.length.toString(16).toUpperCase())
      buffer.push(chunk)
      index += defChunkLength
    }
    this.body!.text = buffer.join(EOL)
  }

  private _generateFormDataBody(): string {
    assertArray(this.body!.params, 'body.params')
    assertNotEmptyString(this.body!.boundary, 'body.boundary')

    if (isEmpty(this.body!.params)) {
      return ''
    }

    const paramsStr = this.body!.params! // eslint-disable-next-line max-statements
      .map((param, index) => {
        if (!param.type) {
          assertNotEmptyString(param.name, 'body.params[index].name', `param index: ${index}`)
        }
        let paramGroupStr = '--' + this.body!.boundary!
        paramGroupStr += EOL
        paramGroupStr += `Content-Disposition: ${param.type || 'form-data'}`
        if (param.name) {
          paramGroupStr += `; name="${param.name}"`
        }
        if (param.fileName) {
          paramGroupStr += `; filename="${param.fileName}"`
        }
        paramGroupStr += EOL
        if (param.contentType) {
          paramGroupStr += `Content-Type: ${param.contentType}`
          paramGroupStr += EOL
        }
        paramGroupStr += EOL
        paramGroupStr += getEmptyStringForUndefined(param.value)
        paramGroupStr += EOL
        return paramGroupStr
      })
      .join('')

    return `${paramsStr}--${this.body!.boundary}--`
  }

  private _generateUrlencodedBody(): string {
    assertArray(this.body!.params, 'body.params')
    const paramPairs = arrayToPairs(<HttpZParam[]>this.body!.params!)

    return new URLSearchParams(paramPairs).toString()
  }

  private _generateTextBody(): string {
    return getEmptyStringForUndefined(this.body!.text)
  }
}
