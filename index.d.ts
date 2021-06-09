export class consts {
  EOL: string;
  EOL2X: string;
  regexps: string;
  http: {
    protocols: string;
    protocolVersions: string;
    methods: string;
    postMethods: string;
    contentTypes: string;
    headers: string;
  }
}

export namespace utils {
  function splitByDelimeter(str: string, delimiter: string): any;
  function isAbsoluteUrl(url: string): boolean;
  function parseUrl(path?: string, origin?: string): any;
  function generateUrl(protocol: string, host: string, port: number, path: string, params: HttpZParam[]): string;
  function generatePath(path: string, params: HttpZParam[]): string;
  function convertParamsArrayToPairs(params: HttpZParam[]): any[];
  function pretifyHeaderName(name: string): string;
  function getEmptyStringForUndefined(val?: string): string;
  function extendIfNotUndefined(obj: any, fieldName: string, fieldValue?: any): any;
}

export class HttpZError extends Error {}

declare class HttpZParam {
  name: string;
  value?: string;
}

declare class HttpZHeader {
  name: string;
  value?: string;
}

declare class HttpZBodyParam {
  type?: 'inline' | 'attachment';
  contentType?: string;
  name: string;
  fileName?: string;
}

declare class HttpZBody {
  contentType: string;
  boundary: string;
  params: HttpZParam[] | HttpZBodyParam[];
  text: string;
}

declare class HttpZRequestModel {
  method: string;
  protocolVersion: string;
  target: string;
  host: string;
  path: string;
  queryParams?: HttpZParam[];
  headers?: HttpZHeader[];
  cookies?: HttpZParam[];
  body: HttpZBody;
  headersSize: number;
  bodySize: number;
}

declare class HttpZResponseModel {
  protocolVersion: string;
  statusCode: number;
  statusMessage?: string;
  headers?: HttpZHeader[];
  cookies?: HttpZParam[];
  body: HttpZBody;
  headersSize: number;
  bodySize: number;
}

declare class HttpZRequestBuilderModel {
  method: string;
  protocolVersion: string;
  target: string;
  headers?: HttpZHeader[];
  body: HttpZBody;
}

declare class HttpZResponseBuilderModel {
  protocolVersion: string;
  statusCode: number;
  statusMessage?: string;
  headers?: HttpZHeader[];
  body: HttpZBody;
}

declare class HttpZOptions {
  mandatoryHost: boolean;
}

export function parse(rawMessage: string, opts?: HttpZOptions): HttpZRequestModel | HttpZResponseModel;

export function build(messageModel: HttpZRequestBuilderModel | HttpZResponseBuilderModel, opts?: HttpZOptions): string;
