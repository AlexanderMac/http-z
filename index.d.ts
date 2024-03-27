type HttpZParam = {
  name: string;
  value: string;
}

type HttpZHeader = {
  name: string;
  value: string;
}

type HttpZBodyParam = {
  type?: 'inline' | 'attachment';
  contentType?: string;
  name: string;
  fileName?: string;
}

type HttpZBody = {
  contentType: string;
  boundary: string;
  params: HttpZParam[] | HttpZBodyParam[];
  text: string;
}

type HttpZRequestModel = {
  method: string;
  protocolVersion: string;
  target: string;
  host: string;
  path: string;
  queryParams: HttpZParam[];
  headers: HttpZHeader[];
  cookies: HttpZParam[];
  body: HttpZBody;
  headersSize: number;
  bodySize: number;
}

type HttpZResponseModel = {
  protocolVersion: string;
  statusCode: number;
  statusMessage: string;
  headers: HttpZHeader[];
  cookies: HttpZParam[];
  body: HttpZBody;
  headersSize: number;
  bodySize: number;
}

type HttpZRequestBuilderModel = {
  method: string;
  protocolVersion: string;
  target: string;
  headers: HttpZHeader[];
  body: HttpZBody;
}

type HttpZResponseBuilderModel = {
  protocolVersion: string;
  statusCode: number;
  statusMessage: string;
  headers: HttpZHeader[];
  body: HttpZBody;
}

type HttpZOptions = {
  mandatoryHost: boolean;
}

declare const EOL: string;
declare const EOL2X: string;
declare const regexps: object;
declare const http: {
  protocols: string;
  protocolVersions: string;
  methods: string;
  postMethods: string;
  contentTypes: string;
  headers: string;
};

export declare namespace consts {
  export {
    EOL,
    EOL2X,
    regexps,
    http
  };
}

export class HttpZError extends Error { }

export declare namespace utils {
  function splitByDelimiter(str: string, delimiter: string): any;
  function isAbsoluteUrl(url: string): boolean;
  function parseUrl(path?: string, origin?: string): any;
  function generateUrl(protocol: string, host: string, port: number, path: string, params: HttpZParam[]): string;
  function generatePath(path: string, params: HttpZParam[]): string;
  function convertParamsArrayToPairs(params: HttpZParam[]): any[];
  function prettifyHeaderName(name: string): string;
  function getEmptyStringForUndefined(val?: string): string;
  function extendIfNotUndefined(obj: any, fieldName: string, fieldValue?: any): any;
}

export function parse(rawMessage: string, opts?: HttpZOptions): HttpZRequestModel | HttpZResponseModel;

export function build(messageModel: HttpZRequestBuilderModel | HttpZResponseBuilderModel, opts?: HttpZOptions): string;
