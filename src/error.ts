export class HttpZError extends Error {
  static get(...params: ConstructorParameters<typeof HttpZError>): HttpZError {
    return new HttpZError(...params)
  }

  details: string | undefined

  constructor(message: string, details?: string) {
    super(message)

    this.name = this.constructor.name
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}
