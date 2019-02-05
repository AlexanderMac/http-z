'use strict';

const _      = require('lodash');
const should = require('should');
const httpZ  = require('../');

describe('parse()', () => {
  describe('httpMsg', () => {
    it('should throw error when httpMsg is undefined', () => {
      should(httpZ.parse.bind(httpZ, null)).throw(Error, {
        message: 'httpMsg must be defined'
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

    let httpObj = {
      method: 'GET',
      protocol: 'HTTP',
      url: 'example.com/features?p1=v1',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
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

    it('should throw Error when start row doesn\'t have three elements separated by space', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[0] = 'GEThttp://example.com/features?p1=v1 HTTP/1.1';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Start row must be in format: ' +
                 'Method SP Request-URI SP HTTP-Version CRLF. Data: GEThttp://example.com/features?p1=v1 HTTP/1.1'
      });

      httpMsgClone[0] = 'GEThttp://example.com/features?p1=v1HTTP/1.1';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Start row must be in format: ' +
                 'Method SP Request-URI SP HTTP-Version CRLF. Data: GEThttp://example.com/features?p1=v1HTTP/1.1'
      });
    });

    it('should parse GET method', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET http://example.com/features?p1=v1 HTTP/1.1';
      let httpObjClone = _.cloneDeep(httpObj);
      httpObjClone.method = 'GET';

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse DELETE method', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'DELETE http://example.com/features?p1=v1 HTTP/1.1';
      let httpObjClone = _.cloneDeep(httpObj);
      httpObjClone.method = 'DELETE';

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse HTTP protocol and URI without parameters', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET http://example.com/features HTTP/1.1';
      let httpObjClone = _.cloneDeep(httpObj);
      httpObjClone.url = 'example.com/features';

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse HTTP protocol and URI with parameters', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET http://example.com/features?p1=v1 HTTP/1.1';
      let httpObjClone = _.cloneDeep(httpObj);
      httpObjClone.url = 'example.com/features?p1=v1';

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse HTTPS protocol and URI without parameters', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET https://example.com/features HTTP/1.1';
      let httpObjClone = _.cloneDeep(httpObj);
      httpObjClone.url = 'example.com/features';
      httpObjClone.protocol = 'HTTPS';

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse HTTPS protocol and URI with parameters', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET https://example.com/features?p1=v1 HTTP/1.1';
      let httpObjClone = _.cloneDeep(httpObj);
      httpObjClone.url = 'example.com/features?p1=v1';
      httpObjClone.protocol = 'HTTPS';

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse HTTP protocol v1.0', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET http://example.com/features?p1=v1 HTTP/1.0';
      let httpObjClone = _.cloneDeep(httpObj);
      httpObjClone.protocolVersion = 'HTTP/1.0';

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse HTTP protocol v2.0', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      httpMsgClone[0] = 'GET http://example.com/features?p1=v1 HTTP/2.0';
      let httpObjClone = _.cloneDeep(httpObj);
      httpObjClone.protocolVersion = 'HTTP/2.0';

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });
  });

  describe('host row', () => {
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

    let httpObj = {
      method: 'GET',
      protocol: 'HTTP',
      url: 'example.com/features?p1=v1',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
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

    it('should throw Error when host row is invalid', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[1] = 'Host example.com';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Host row must be in format: ' +
                 'Host: Value. Data: Host example.com'
      });

      httpMsgClone[1] = 'Host     ';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Host row must be in format: ' +
                 'Host: Value. Data: Host     '
      });

      httpMsgClone[1] = ': example.com';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Host row must be in format: ' +
                 'Host: Value. Data: : example.com'
      });
    });

    it('should parse valid host row', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);
      httpObjClone.host = 'example.com';

      httpMsgClone[1] = 'Host: example.com';
      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);

      httpMsgClone[1] = 'Host   :  example.com';
      actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
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

    let httpObj = {
      method: 'GET',
      protocol: 'HTTP',
      url: 'example.com/features?p1=v1',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
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

    it('should throw Error when header has invalid format', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[2] = 'Connection keep-alive';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Header row must be in format: ' +
                 'Name: Values. Data: Connection keep-alive'
      });

      httpMsgClone[2] = 'Connection: ';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Header row must be in format: ' +
                 'Name: Values. Data: Connection: '
      });

      httpMsgClone[2] = ' : keep-alive';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Header row must be in format: ' +
                 'Name: Values. Data:  : keep-alive'
      });
    });

    it('should parse valid headers', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjCloneo = _.cloneDeep(httpObj);

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjCloneo);
    });

    it('should parse Accept-Language header with one value', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);

      httpMsgClone[7] = 'Accept-Language: ru-RU;q=0.8';
      httpObjClone.headers[5].values = [
        { value: 'ru-RU', params: 'q=0.8' }
      ];

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse Accept-Language header with two values', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);

      httpMsgClone[7] = 'Accept-Language: ru-RU;q=0.8, en-US';
      httpObjClone.headers[5].values = [
        { value: 'ru-RU', params: 'q=0.8' },
        { value: 'en-US', params: null }
      ];

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
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

    let httpObj = {
      method: 'GET',
      protocol: 'HTTP',
      url: 'example.com/features?p1=v1',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
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

    it('should throw Error when cookie row is invalid', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[8] = 'Cookie: ';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Cookie row must be in format: ' +
                 'Cookie: Name1=Value1;.... Data: Cookie:'
      });
    });

    it('should not throw Error when cookie row is empty', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);

      httpMsgClone.splice(8, 1);
      httpObjClone.cookies = null;

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse cookie with one name-value pair', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);

      httpMsgClone[8] = 'Cookie: csrftoken=123abc';
      httpObjClone.cookies = [
        { name: 'csrftoken', value: '123abc' }
      ];

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse cookie with one name-value pair and parameters', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);

      httpMsgClone[8] = 'Cookie: csrftoken=123abc;sessionid=456def';
      httpObjClone.cookies = [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '456def' }
      ];

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
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

    let httpObj = {
      method: 'GET',
      protocol: 'HTTP',
      url: 'example.com/features?p1=v1',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
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
        },
      ],
      cookies: null,
      body: null
    };

    it('should throw Error when body has invalid format and ContentType=application/x-www-form-urlencoded', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[8] = 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8';

      httpMsgClone[11] = 'id=11&messageHello';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Invalid x-www-form-url-encode parameter. ' +
                 'Data: messageHello'
      });

      httpMsgClone[11] = 'id=11&message=Hello&';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Invalid x-www-form-url-encode parameter'
      });
    });

    it('should throw Error when body has invalid format and ContentType=multipart/form-data', () => {
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
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Invalid formData parameter. ' +
                 'Data: \nContent-Disposit: form-data; name="Name"\n\nSmith\n'
      });
    });

    it('should throw Error when ContentType=multipart/form-data without and boundary parameter has invalid format', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpMsgClone[11] = 'body';

      httpMsgClone[8] = 'Content-Type: multipart/form-data';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Request with ContentType=FormData must have a header with boundary'
      });

      httpMsgClone[8] = 'Content-Type: multipart/form-data; boundary';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Boundary param must be in format: boundary=value. ' +
                 'Data: boundary'
      });

      httpMsgClone[8] = 'Content-Type: multipart/form-data; boundary=';
      should(httpZ.parse.bind(null, httpMsgClone.join('\n'))).throw(Error, {
        message: 'Boundary param must be in format: boundary=value. ' +
                 'Data: boundary='
      });
    });

    it('should not throw Error when body is empty', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);

      httpObjClone.body = null;

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse valid body with ContentType=application/x-www-form-urlencoded', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);

      httpMsgClone[8] = 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8';
      httpMsgClone[11] = 'id=11&message=Hello';

      httpObjClone.headers[6].values = [{
        value: 'application/x-www-form-urlencoded',
        params: 'charset=UTF-8'
      }];
      httpObjClone.body = {
        contentType: 'application/x-www-form-urlencoded',
        formDataParams: [
          {
            name: 'id', value: '11' },
          {
            name: 'message', value: 'Hello' }
        ]
      };

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse valid body with ContentType=multipart/form-data', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);

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

      httpObjClone.headers[6].values = [{
        value: 'multipart/form-data',
        params: 'boundary=------11136253119209'
      }];
      httpObjClone.body = {
        contentType: 'multipart/form-data',
        boundary: '------11136253119209',
        formDataParams: [
          {
            name: 'Name', value: 'Smith' },
          {
            name: 'Age', value: '25' }
        ]
      };

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse valid body with ContentType=application/json', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);

      httpMsgClone[8] = 'Content-Type: application/json';
      httpMsgClone[11] = '{{"p1": "v1"}, {"p2": "v2"}}';

      httpObjClone.headers[6].values = [{
        value: 'application/json',
        params: null
      }];
      httpObjClone.body = {
        contentType: 'application/json',
        json: '{{"p1": "v1"}, {"p2": "v2"}}'
      };

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });

    it('should parse valid body with ContentType=text/plain', () => {
      let httpMsgClone = _.cloneDeep(httpMsg);
      let httpObjClone = _.cloneDeep(httpObj);

      httpMsgClone[8] = 'Content-Type: text/plain';
      httpMsgClone[11] = 'Plain text';

      httpObjClone.headers[6].values = [{
        value: 'text/plain',
        params: null
      }];
      httpObjClone.body = {
        contentType: 'text/plain',
        plain: 'Plain text'
      };

      let actual = httpZ.parse(httpMsgClone.join('\n'));
      should(actual).eql(httpObjClone);
    });
  });
});
