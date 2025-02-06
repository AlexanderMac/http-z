import { EOL, regexps } from '../constants'
import { HttpZError } from '../error'
import { HttpZBodyParam } from '../types'
import { extendIfNotUndefined, trim, trimEnd } from '../utils'

export class FormDataParamParser {
  // TODO: test it
  static parse(...params: ConstructorParameters<typeof FormDataParamParser>): HttpZBodyParam {
    const instance = new FormDataParamParser(...params)
    return instance.parse()
  }

  constructor(private paramGroup: string) {}

  // TODO: test it
  parse(): HttpZBodyParam {
    this.paramGroup = this.paramGroup.replace(regexps.startNl, '').replace(regexps.endNl, '')

    const contentDispositionHeader = this._getContentDisposition()
    const contentType = this._getContentType()
    const dispositionType = this._getDispositionType(contentDispositionHeader)
    const name = dispositionType === 'form-data' ? this._getParamName(contentDispositionHeader) : undefined
    const fileName = this._getFileName(contentDispositionHeader)
    const value = this._getParamValue()

    const param: HttpZBodyParam = {
      value,
    }
    if (dispositionType !== 'form-data') {
      param.type = dispositionType
    }
    extendIfNotUndefined(param, 'contentType', contentType)
    extendIfNotUndefined(param, 'name', name)
    extendIfNotUndefined(param, 'fileName', fileName)

    return param
  }

  // TODO: test it
  private _getContentDisposition(): string | never {
    const contentDisposition = this.paramGroup.match(regexps.contentDisposition)
    if (contentDisposition) {
      this.paramGroup = this.paramGroup.replace(contentDisposition[0], '')
      return trimEnd(contentDisposition[0], EOL)
    }
    throw HttpZError.get('Incorrect Content-Disposition', this.paramGroup)
  }

  // TODO: test it
  private _getContentType(): string | undefined {
    const contentType = this.paramGroup.match(regexps.contentType)
    if (contentType) {
      this.paramGroup = this.paramGroup.replace(contentType[0], '')
      return trimEnd(
        contentType
          .toString()
          .toLowerCase()
          .replace(/^content-type: */, ''),
        EOL,
      )
    }
  }

  // TODO: test it
  private _getDispositionType(contentDisposition: string): string | never {
    const dispositionType = contentDisposition.match(regexps.contentDispositionType)
    if (dispositionType) {
      return dispositionType[0].trim().toLowerCase()
    }
    throw HttpZError.get('Incorrect Content-Disposition type', contentDisposition)
  }

  // TODO: test it
  private _getParamName(contentDisposition: string): string | never {
    const paramName = contentDisposition.match(regexps.dispositionName)
    if (paramName) {
      return trim(paramName[0], '"')
    }
    throw HttpZError.get('Incorrect Content-Disposition, expected param name', contentDisposition)
  }

  // TODO: test it
  private _getFileName(contentDisposition: string): string | undefined {
    const fileName = contentDisposition.match(regexps.dispositionFileName)
    if (fileName) {
      return trim(fileName[0], '"')
    }
  }

  // TODO: test it
  private _getParamValue(): string | never {
    if (this.paramGroup.match(regexps.startNl)) {
      return this.paramGroup.replace(regexps.startNl, '')
    }
    throw HttpZError.get('Incorrect form-data parameter', this.paramGroup)
  }
}
