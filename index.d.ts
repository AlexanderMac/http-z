export class consts {
  EOL: string;
  EOL2X: string;
  regexps: any;
  http: {
    protocols: any;
    protocolVersions: any;
    methods: any;
    postMethods: any;
    contentTypes: any;
    headers: any;
  };
}

declare namespace utils {
  function splitByDelimeter(str: string, delimiter: string): any;
  function parseUrl(path?: string, origin?: string): any;
  function generateUrl(protocol: string, host: string, port?: number, path: string, params: HttpZParam[]): string;
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
  protocol: string;
  protocolVersion: string;
  host: string;
  path: string;
  headersSize: number;
  bodySize: number;
  queryParams?: HttpZParam[];
  headers?: HttpZHeader[];
  cookies?: HttpZParam[];
  body: HttpZBody;
}

declare class HttpZResponseModel {
  protocolVersion: string;
  statusCode: number;
  statusMessage?: string;
  headersSize: number;
  bodySize: number;
  headers?: HttpZHeader[];
  cookies?: HttpZParam[];
  body: HttpZBody;
}

export function parse(rawMessage: string): HttpZRequestModel | HttpZResponseModel;

export function build(messageModel: HttpZRequestModel | HttpZResponseModel): string;
