type Http4xxCode = 400 | 401 | 404;

export class ReplyError extends Error {
  message: string;
  code: Http4xxCode

  constructor(message: string, code: Http4xxCode) {
    super(message);

    this.message = message;
    this.code = code
  }
}