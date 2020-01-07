module.exports = class HttpZError extends Error {
  static get(...params) {
    return new HttpZError(...params);
  }

  constructor(message, details) {
    super(message);

    this.name = this.constructor.name;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
};
