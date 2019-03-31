'use strict';

const _      = require('lodash');
const should = require('should');
const httpZ  = require('../../');

describe('parsers / base', () => {
  describe('httpMsg', () => {
    it('should throw error when httpMsg is undefined', () => {
      should(httpZ.parse.bind(null)).throw(Error, {
        message: 'Unknown message format'
      });
    });
  });

  describe('start row', () => {
    let httpMsg = [
      'GET http://example.com/features?p1=v1 HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'User-Agent: Mozilla/5.0 (Windows NT 6.1 WOW64)',
      'Accept: */*',
      'Accept-Encoding: gzip,deflate',
      'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      '',
      ''
    ];

    let httpModel = {
      method: 'GET',
      protocol: 'HTTP',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
      path: '/features',
      params: { p1: 'v1' },
      basicAuth: {},
      headers: [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive', params: null }
          ]
        },
        {
          name: 'Cache-Control',
          values: [
            { value: 'no-cache', params: null }
          ]
        },
        {
          name: 'User-Agent',
          values: [
            { value: 'Mozilla/5.0 (Windows NT 6.1 WOW64)', params: null }
          ]
        },
        {
          name: 'Accept',
          values: [
            { value: '*/*', params: null }
          ]
        },
        {
          name: 'Accept-Encoding',
          values: [
            { value: 'gzip', params: null },
            { value: 'deflate', params: null }
          ]
        },
        {
          name: 'Accept-Language',
          values: [
            { value: 'ru-RU', params: null },
            { value: 'ru', params: 'q=0.8' },
            { value: 'en-US', params: 'q=0.6' },
            { value: 'en', params: 'q=0.4' }
          ]
        }
      ],
      cookies: null,
      body: null
    };

    it('should throw error when start row has invalid format', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[0] = 'absolutely wrong string';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Unknown message format'
      });
    });

    it('should parse GET method', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET http://example.com/features?p1=v1 HTTP/1.1';
      let httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.method = 'GET';

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse DELETE method', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'DELETE http://example.com/features?p1=v1 HTTP/1.1';
      let httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.method = 'DELETE';

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse HTTP protocol and url without parameters', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET http://example.com/features HTTP/1.1';
      let httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.params = {};

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse HTTP protocol and url with parameters', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET http://example.com/features?p1=v1 HTTP/1.1';
      let httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.params = { p1: 'v1' };

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse HTTPS protocol', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET https://example.com/features HTTP/1.1';
      let httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.protocol = 'HTTPS';
      httpModelClone.params = {};

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse HTTP protocol v1.0', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET http://example.com/features?p1=v1 HTTP/1.0';
      let httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.protocolVersion = 'HTTP/1.0';

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse HTTP protocol v2.0', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET http://example.com/features?p1=v1 HTTP/2.0';
      let httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.protocolVersion = 'HTTP/2.0';

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });
  });

  describe('headers', () => {
    let httpMsg = [
      'GET http://example.com/features?p1=v1 HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'User-Agent: Mozilla/5.0 (Windows NT 6.1 WOW64)',
      'Accept: */*',
      'Accept-Encoding: gzip,deflate',
      'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'Referer: http://app2.net/user/fjvbuq/',
      '',
      ''
    ];

    let httpModel = {
      method: 'GET',
      protocol: 'HTTP',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
      path: '/features',
      params: { p1: 'v1' },
      basicAuth: {},
      headers: [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive', params: null }
          ]
        },
        {
          name: 'Cache-Control',
          values: [
            { value: 'no-cache', params: null }
          ]
        },
        {
          name: 'User-Agent',
          values: [
            { value: 'Mozilla/5.0 (Windows NT 6.1 WOW64)', params: null }
          ]
        },
        {
          name: 'Accept',
          values: [
            { value: '*/*', params: null }
          ]
        },
        {
          name: 'Accept-Encoding',
          values: [
            { value: 'gzip', params: null },
            { value: 'deflate', params: null }
          ]
        },
        {
          name: 'Accept-Language',
          values: [
            { value: 'ru-RU', params: null },
            { value: 'ru', params: 'q=0.8' },
            { value: 'en-US', params: 'q=0.6' },
            { value: 'en', params: 'q=0.4' }
          ]
        },
        {
          name: 'Referer',
          values: [
            { value: 'http://app2.net/user/fjvbuq/', params: null }
          ]
        }
      ],
      cookies: null,
      body: null
    };

    it('should throw error when header has invalid format', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[2] = 'Connection keep-alive';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Header row must be in format: ' +
                 'Name: Values. Data: Connection keep-alive'
      });

      httpMsgClone[2] = 'Connection: ';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Header row must be in format: ' +
                 'Name: Values. Data: Connection: '
      });

      httpMsgClone[2] = ' : keep-alive';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Header row must be in format: ' +
                 'Name: Values. Data:  : keep-alive'
      });
    });

    it('should parse valid headers', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelCloneo = _.cloneDeep(httpModel);

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelCloneo);
    });

    it('should parse Accept-Language header with one value', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelClone = _.cloneDeep(httpModel);

      httpMsgClone[7] = 'Accept-Language: ru-RU;q=0.8';
      httpModelClone.headers[5].values = [
        { value: 'ru-RU', params: 'q=0.8' }
      ];

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse Accept-Language header with two values', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelClone = _.cloneDeep(httpModel);

      httpMsgClone[7] = 'Accept-Language: ru-RU;q=0.8, en-US';
      httpModelClone.headers[5].values = [
        { value: 'ru-RU', params: 'q=0.8' },
        { value: 'en-US', params: null }
      ];

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });
  });

  describe('cookies', () => {
    let httpMsg = [
      'GET http://example.com/features?p1=v1 HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'User-Agent: Mozilla/5.0 (Windows NT 6.1 WOW64)',
      'Accept: */*',
      'Accept-Encoding: gzip,deflate',
      'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'Cookie: csrftoken=123abc;sessionid=456def',
      '',
      ''
    ];

    let httpModel = {
      method: 'GET',
      protocol: 'HTTP',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
      path: '/features',
      params: { p1: 'v1' },
      basicAuth: {},
      headers: [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive', params: null }
          ]
        },
        {
          name: 'Cache-Control',
          values: [
            { value: 'no-cache', params: null }
          ]
        },
        {
          name: 'User-Agent',
          values: [
            { value: 'Mozilla/5.0 (Windows NT 6.1 WOW64)', params: null }
          ]
        },
        {
          name: 'Accept',
          values: [
            { value: '*/*', params: null }
          ]
        },
        {
          name: 'Accept-Encoding',
          values: [
            { value: 'gzip', params: null },
            { value: 'deflate', params: null }
          ]
        },
        {
          name: 'Accept-Language',
          values: [
            { value: 'ru-RU', params: null },
            { value: 'ru', params: 'q=0.8' },
            { value: 'en-US', params: 'q=0.6' },
            { value: 'en', params: 'q=0.4' }
          ]
        }
      ],
      cookies: [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '456def' }
      ],
      body: null
    };

    it('should throw error when cookie row is invalid', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[8] = 'Cookie: ';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Cookie row must be in format: ' +
                 'Cookie: Name1=Value1;.... Data: Cookie:'
      });
    });

    it('should not throw Error when cookie row is empty', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelClone = _.cloneDeep(httpModel);

      httpMsgClone.splice(8, 1);
      httpModelClone.cookies = null;

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse cookie with one name-value pair', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelClone = _.cloneDeep(httpModel);

      httpMsgClone[8] = 'Cookie: csrftoken=123abc';
      httpModelClone.cookies = [
        { name: 'csrftoken', value: '123abc' }
      ];

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse cookie with one name-value pair and parameters', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelClone = _.cloneDeep(httpModel);

      httpMsgClone[8] = 'Cookie: csrftoken=123abc;sessionid=456def';
      httpModelClone.cookies = [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '456def' }
      ];

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });
  });

  describe('body', () => {
    let httpMsg = [
      'GET http://example.com/features?p1=v1 HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'User-Agent: Mozilla/5.0 (Windows NT 6.1 WOW64)',
      'Accept: */*',
      'Accept-Encoding: gzip,deflate',
      'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
      'Content-Length: 301',
      '',
      ''
    ];

    let httpModel = {
      method: 'GET',
      protocol: 'HTTP',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
      path: '/features',
      params: { p1: 'v1' },
      basicAuth: {},
      headers: [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive', params: null }
          ]
        },
        {
          name: 'Cache-Control',
          values: [
            { value: 'no-cache', params: null }
          ]
        },
        {
          name: 'User-Agent',
          values: [
            { value: 'Mozilla/5.0 (Windows NT 6.1 WOW64)', params: null }
          ]
        },
        {
          name: 'Accept',
          values: [
            { value: '*/*', params: null }
          ]
        },
        {
          name: 'Accept-Encoding',
          values: [
            { value: 'gzip', params: null },
            { value: 'deflate', params: null }
          ]
        },
        {
          name: 'Accept-Language',
          values: [
            { value: 'ru-RU', params: null },
            { value: 'ru', params: 'q=0.8' },
            { value: 'en-US', params: 'q=0.6' },
            { value: 'en', params: 'q=0.4' }
          ]
        },
        {
          name: 'Content-Type',
          values: [
            { value: 'application/x-www-form-urlencoded', params: 'charset=UTF-8' }
          ]
        },
        {
          name: 'Content-Length',
          values: [
            { value: '301', params: null }
          ]
        }
      ],
      cookies: null,
      body: null
    };

    it('should throw error when body has invalid format and ContentType=application/x-www-form-urlencoded', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[8] = 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8';

      httpMsgClone[11] = 'id=11&messageHello';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Invalid x-www-form-url-encode parameter. ' +
                 'Data: messageHello'
      });

      httpMsgClone[11] = 'id=11&message=Hello&';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Invalid x-www-form-url-encode parameter'
      });
    });

    it('should throw error when body has invalid format and ContentType=multipart/form-data', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[8] = 'Content-Type: multipart/form-data; boundary=------11136253119209';
      httpMsgClone[11] = '-----------------------------11136253119209';
      httpMsgClone[12] = 'Content-Disposit: form-data; name="Name"';
      httpMsgClone[13] = '';
      httpMsgClone[14] = 'Smith';
      httpMsgClone[15] = '-----------------------------11136253119209';
      httpMsgClone[16] = 'Content-Disposition: form-data;';
      httpMsgClone[17] = '';
      httpMsgClone[18] = '25';
      httpMsgClone[19] = '-----------------------------11136253119209--';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Invalid formData parameter. ' +
                 'Data: \nContent-Disposit: form-data; name="Name"\n\nSmith\n'
      });
    });

    it('should throw error when boundary parameter has invalid format and ContentType=multipart/form-data ', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[11] = 'body';

      httpMsgClone[8] = 'Content-Type: multipart/form-data';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Request with ContentType=FormData must have a header with boundary'
      });

      httpMsgClone[8] = 'Content-Type: multipart/form-data; boundary';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Boundary param must be in format: boundary=value. ' +
                 'Data: boundary'
      });

      httpMsgClone[8] = 'Content-Type: multipart/form-data; boundary=';
      should(httpZ.parse.bind(null, { httpMessage: httpMsgClone.join('\n') })).throw(Error, {
        message: 'Boundary param must be in format: boundary=value. ' +
                 'Data: boundary='
      });
    });

    it('should not throw Error when body is empty', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelClone = _.cloneDeep(httpModel);

      httpModelClone.body = null;

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse valid body with ContentType=application/x-www-form-urlencoded', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelClone = _.cloneDeep(httpModel);

      httpMsgClone[8] = 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8';
      httpMsgClone[11] = 'id=11&message=Hello';

      httpModelClone.headers[6].values = [{
        value: 'application/x-www-form-urlencoded',
        params: 'charset=UTF-8'
      }];
      httpModelClone.body = {
        contentType: 'application/x-www-form-urlencoded',
        formDataParams: [
          { name: 'id', value: '11' },
          { name: 'message', value: 'Hello' }
        ]
      };

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse valid body with ContentType=multipart/form-data', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelClone = _.cloneDeep(httpModel);

      httpMsgClone[8] = 'Content-Type: multipart/form-data; boundary=------11136253119209';
      httpMsgClone[11] = '-----------------------------11136253119209';
      httpMsgClone[12] = 'Content-Disposition: form-data; name="Name"';
      httpMsgClone[13] = '';
      httpMsgClone[14] = 'Smith';
      httpMsgClone[15] = '-----------------------------11136253119209';
      httpMsgClone[16] = 'Content-Disposition: form-data; name="Age"';
      httpMsgClone[17] = '';
      httpMsgClone[18] = '25';
      httpMsgClone[19] = '-----------------------------11136253119209--';

      httpModelClone.headers[6].values = [{
        value: 'multipart/form-data',
        params: 'boundary=------11136253119209'
      }];
      httpModelClone.body = {
        contentType: 'multipart/form-data',
        boundary: '------11136253119209',
        formDataParams: [
          { name: 'Name', value: 'Smith' },
          { name: 'Age', value: '25' }
        ]
      };

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse valid body with ContentType=application/json', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelClone = _.cloneDeep(httpModel);

      httpMsgClone[8] = 'Content-Type: application/json';
      httpMsgClone[11] = '{"p1":"v1","p2":"v2"}';

      httpModelClone.headers[6].values = [{
        value: 'application/json',
        params: null
      }];
      httpModelClone.body = {
        contentType: 'application/json',
        json: { p1: 'v1', p2: 'v2' }
      };

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });

    it('should parse valid body with ContentType=text/plain', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpModelClone = _.cloneDeep(httpModel);

      httpMsgClone[8] = 'Content-Type: text/plain';
      httpMsgClone[11] = 'Plain text';

      httpModelClone.headers[6].values = [{
        value: 'text/plain',
        params: null
      }];
      httpModelClone.body = {
        contentType: 'text/plain',
        plain: 'Plain text'
      };

      let actual = httpZ.parse({ httpMessage: httpMsgClone.join('\n') });
      should(actual).eql(httpModelClone);
    });
  });
});
