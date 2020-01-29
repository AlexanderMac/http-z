declare class HttpZConsts {}

declare class HttpZError extends Error {}

declare class HttpZParam {
  name: string;
  value: string;
}

declare class HttpZBody {
  contentType: string;
  boundary: string;
  params: [HttpZParam];
  json: object;
  plain: string;
}

declare class HttpZRequestModel {
  method: string;
  protocol: string;
  protocolVersion: string;
  host: string;
  path: string;
  messageSize: number;
  headersSize: number;
  bodySize: number;
  queryParams?: [HttpZParam];
  headers?: [HttpZParam];
  cookies?: [HttpZParam];
  body: HttpZBody;
}

declare class HttpZResponseModel {
  protocolVersion: string;
  statusCode: number;
  statusMessage?: string;
  messageSize: number;
  headersSize: number;
  bodySize: number;
  headers?: [HttpZParam];
  cookies?: [HttpZParam];
  body: HttpZBody;
}

declare function parse(plainMessage: string): HttpZRequestModel | HttpZResponseModel;

declare function build(messageModel: HttpZRequestModel | HttpZResponseModel): string;

export class HttpZ {
  parse;
  build;
  consts: HttpZConsts;
  HttpZError: HttpZError;
}
