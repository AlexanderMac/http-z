import { EOL, EOL2X, HttpContentTypeApplication, HttpContentTypeMultipart, HttpHeader, regexps } from '../constants'
import { HttpZError } from '../error'
import { HttpZBody, HttpZHeader } from '../types'
import { splitBy, prettifyHeaderName, head, tail, isNil, trim } from '../utils'
import { FormDataParamParser } from './form-data-param-parser'

export class HttpZBaseParser {
  protected startRow!: string
  protected headerRows!: string[]
  protected bodyRows!: string

  protected headers!: HttpZHeader[]
  protected headersSize!: number
  protected body: HttpZBody | undefined
  protected bodySize!: number

  constructor(private readonly rawMessage: string) {}

  protected _parseMessageForRows(): void {
    const [headers, body] = splitBy(this.rawMessage, EOL2X)
    if (isNil(headers) || isNil(body)) {
      throw HttpZError.get(
        'Incorrect message format, expected: start-line CRLF *(header-field CRLF) CRLF [message-body]',
      )
    }

    this._calcSizes(headers, body)
    const headerRows = headers.split(EOL)

    this.startRow = head(headerRows)
    this.headerRows = tail(headerRows)
    this.bodyRows = body
  }

  protected _parseHeaderRows(): void {
    this.headers = this.headerRows.map(hRow => {
      // eslint-disable-next-line prefer-const
      let [name, value] = splitBy(hRow, ':')
      if (!name) {
        throw HttpZError.get('Incorrect header row format, expected: Name: Value', hRow)
      }

      // quoted string must be parsed as a single value (https://tools.ietf.org/html/rfc7230#section-3.2.6)
      if (isNil(value)) {
        value = ''
      } else if (regexps.quotedHeaderValue.test(value)) {
        value = trim(value, '"')
      }

      return {
        name: prettifyHeaderName(name),
        value,
      }
    })
  }

  protected _parseBodyRows(): void {
    if (!this.bodyRows) {
      return
    }

    this._processTransferEncodingChunked()

    this.body = <HttpZBody>{}
    const contentTypeHeader = this._getContentTypeValue()
    if (contentTypeHeader) {
      this.body.contentType = contentTypeHeader.toLowerCase().split(';')[0]
    }
    switch (this.body.contentType) {
      case HttpContentTypeMultipart.formData:
      case HttpContentTypeMultipart.alternative:
      case HttpContentTypeMultipart.mixed:
      case HttpContentTypeMultipart.related:
        this._parseFormDataBody()
        break
      case HttpContentTypeApplication.xWwwFormUrlencoded:
        this._parseUrlencodedBody()
        break
      default:
        this._parseTextBody()
        break
    }
  }

  // eslint-disable-next-line max-statements
  protected _processTransferEncodingChunked(): void {
    const isChunked = this.headers.find(
      h => h.name === HttpHeader.transferEncoding.toString() && h.value.includes('chunked'),
    )
    if (!isChunked) {
      return
    }

    let text = this.bodyRows
    const buffer: string[] = []
    do {
      const rows = text.match(regexps.chunkRow)
      const firstRow = rows ? rows[0] : ''
      const chunkLength = +('0x' + firstRow || '').trim()
      if (!chunkLength) {
        throw HttpZError.get('Incorrect row, expected: NumberEOL', this.bodyRows)
      }
      text = text.slice(firstRow.length)
      const chunk = text.slice(0, chunkLength)
      buffer.push(chunk)
      text = text.slice(chunkLength + EOL.length)
    } while (text)

    this.bodyRows = buffer.join('')
  }

  protected _parseFormDataBody(): void {
    this.body!.boundary = this._getBoundary()
    this.body!.params = this.bodyRows
      .split(`--${this.body!.boundary}`)
      // skip first and last items, which contains boundary
      .filter((unused, index, params) => index > 0 && index < params.length - 1)
      .map(paramGroup => FormDataParamParser.parse(paramGroup))
  }

  protected _parseUrlencodedBody(): void {
    const params = new URLSearchParams(this.bodyRows)
    this.body!.params = []
    params.forEach((value, name) => {
      this.body!.params!.push({ name, value })
    })
  }

  protected _parseTextBody(): void {
    this.body!.text = this.bodyRows
  }

  protected _calcSizes(headers: string, body: string): void {
    this.headersSize = (headers + EOL2X).length
    this.bodySize = body.length
  }

  protected _getContentTypeValue(): string | undefined {
    const contentTypeHeader = this.headers.find(h => h.name === HttpHeader.contentType.toString())
    if (!contentTypeHeader) {
      return
    }
    if (!contentTypeHeader.value) {
      return
    }
    return contentTypeHeader.value
  }

  protected _getBoundary(): string | never {
    const contentTypeValue = this._getContentTypeValue()
    if (!contentTypeValue) {
      throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary')
    }

    const params = contentTypeValue.split(';')[1]
    if (!params) {
      throw HttpZError.get('Message with multipart/form-data body must have Content-Type header with boundary')
    }

    const boundary = params.match(regexps.boundary)
    if (!boundary) {
      throw HttpZError.get('Incorrect boundary, expected: boundary=value', params)
    }
    return trim(boundary[0], '"')
  }
}
