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

  describe('start-line', () => {
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

    it('should throw Error when start-line doesn\'t have three parts separated by space', () => {
      let rm = _.cloneDeep(httpMsg);

      rm[0] = 'GEThttp://example.com/features?p1=v1 HTTP/1.1';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'start-line must have format: ' +
                 '[Method] [Url] [Protocol]. Data: GEThttp://example.com/features?p1=v1 HTTP/1.1'
      });

      rm[0] = 'GEThttp://example.com/features?p1=v1HTTP/1.1';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'start-line must have format: ' +
                 '[Method] [Url] [Protocol]. Data: GEThttp://example.com/features?p1=v1HTTP/1.1'
      });
    });

    it('should throw Error when start-line has invalid url', () => {
      let rm = _.cloneDeep(httpMsg);

      rm[0] = 'GET example.com/features?p1=v1 HTTP/1.1';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Url in start-line must have format: ' +
                 '[Protocol]://[Address]. Data: example.com/features?p1=v1'
      });

      rm[0] = 'GET http:/example.com/features?p1=v1 HTTP/1.1';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Url in start-line must have format: ' +
                 '[Protocol]://[Address]. Data: http:/example.com/features?p1=v1'
      });

      rm[0] = 'GET www.example.com/features?p1=v1 HTTP/1.1';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Url in start-line must have format: ' +
                 '[Protocol]://[Address]. Data: www.example.com/features?p1=v1'
      });
    });

    it('should parse GET method', () => {
      let rm = _.cloneDeep(httpMsg);
      rm[0] = 'GET http://example.com/features?p1=v1 HTTP/1.1';
      let ro = _.cloneDeep(httpObj);
      ro.method = 'GET';

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse DELETE method', () => {
      let rm = _.cloneDeep(httpMsg);
      rm[0] = 'DELETE http://example.com/features?p1=v1 HTTP/1.1';
      let ro = _.cloneDeep(httpObj);
      ro.method = 'DELETE';

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse HTTP protocol and URI without parameters', () => {
      let rm = _.cloneDeep(httpMsg);
      rm[0] = 'GET http://example.com/features HTTP/1.1';
      let ro = _.cloneDeep(httpObj);
      ro.url = 'example.com/features';

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse HTTP protocol and URI with parameters', () => {
      let rm = _.cloneDeep(httpMsg);
      rm[0] = 'GET http://example.com/features?p1=v1 HTTP/1.1';
      let ro = _.cloneDeep(httpObj);
      ro.url = 'example.com/features?p1=v1';

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse HTTPS protocol and URI without parameters', () => {
      let rm = _.cloneDeep(httpMsg);
      rm[0] = 'GET https://example.com/features HTTP/1.1';
      let ro = _.cloneDeep(httpObj);
      ro.url = 'example.com/features';
      ro.protocol = 'HTTPS';

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse HTTPS protocol and URI with parameters', () => {
      let rm = _.cloneDeep(httpMsg);
      rm[0] = 'GET https://example.com/features?p1=v1 HTTP/1.1';
      let ro = _.cloneDeep(httpObj);
      ro.url = 'example.com/features?p1=v1';
      ro.protocol = 'HTTPS';

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse HTTP protocol v1.0', () => {
      let rm = _.cloneDeep(httpMsg);
      rm[0] = 'GET http://example.com/features?p1=v1 HTTP/1.0';
      let ro = _.cloneDeep(httpObj);
      ro.protocolVersion = 'HTTP/1.0';

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse HTTP protocol v2.0', () => {
      let rm = _.cloneDeep(httpMsg);
      rm[0] = 'GET http://example.com/features?p1=v1 HTTP/2.0';
      let ro = _.cloneDeep(httpObj);
      ro.protocolVersion = 'HTTP/2.0';

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });
  });

  describe('host line', () => {
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

    it('should throw Error when host line is invalid', () => {
      let rm = _.cloneDeep(httpMsg);

      rm[1] = 'Host example.com';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Host line must have format: ' +
                 '[Host]: [Value]. Data: Host example.com'
      });

      rm[1] = 'Host     ';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Host line must have format: ' +
                 '[Host]: [Value]. Data: Host     '
      });

      rm[1] = ': example.com';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Host line must have format: ' +
                 '[Host]: [Value]. Data: : example.com'
      });
    });

    it('should parse valid host line', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);
      ro.host = 'example.com';

      rm[1] = 'Host: example.com';
      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);

      rm[1] = 'Host   :  example.com';
      actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
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
      let rm = _.cloneDeep(httpMsg);

      rm[2] = 'Connection keep-alive';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Header line must have format: ' +
                 '[HeaderName]: [HeaderValues]. Data: Connection keep-alive'
      });

      rm[2] = 'Connection: ';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Header line must have format: ' +
                 '[HeaderName]: [HeaderValues]. Data: Connection: '
      });

      rm[2] = ' : keep-alive';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Header line must have format: ' +
                 '[HeaderName]: [HeaderValues]. Data:  : keep-alive'
      });
    });

    it('should parse valid headers', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse Accept-Language header with one value', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      rm[7] = 'Accept-Language: ru-RU;q=0.8';
      ro.headers[5].values = [
        { value: 'ru-RU', params: 'q=0.8' }
      ];

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse Accept-Language header with two values', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      rm[7] = 'Accept-Language: ru-RU;q=0.8, en-US';
      ro.headers[5].values = [
        { value: 'ru-RU', params: 'q=0.8' },
        { value: 'en-US', params: null }
      ];

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
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

    it('should throw Error when cookie line is invalid', () => {
      let rm = _.cloneDeep(httpMsg);

      rm[8] = 'Cookie: ';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Cookie line must have format: ' +
                 'Cookie: [Name1]=[Value1].... Data: Cookie: '
      });
    });

    it('should not throw Error when cookie line is empty', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      rm.splice(8, 1);
      ro.cookies = null;

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse cookie with one name-value pair', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      rm[8] = 'Cookie: csrftoken=123abc';
      ro.cookies = [
        { name: 'csrftoken', value: '123abc' }
      ];

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse cookie with one name-value pair and parameters', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      rm[8] = 'Cookie: csrftoken=123abc;sessionid=456def';
      ro.cookies = [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '456def' }
      ];

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
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
      let rm = _.cloneDeep(httpMsg);

      rm[8] = 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8';

      rm[11] = 'id=11&messageHello';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Invalid x-www-form-url-encode parameter. ' +
                 'Data: messageHello'
      });

      rm[11] = 'id=11&message=Hello& ';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Invalid x-www-form-url-encode parameter. ' +
                 'Data:  '
      });
    });

    it('should throw Error when body has invalid format and ContentType=multipart/form-data', () => {
      let rm = _.cloneDeep(httpMsg);

      rm[8] = 'Content-Type: multipart/form-data; boundary=------11136253119209';
      rm[11] = '-----------------------------11136253119209';
      rm[12] = 'Content-Disposit: form-data; name="Name"';
      rm[13] = '';
      rm[14] = 'Smith';
      rm[15] = '-----------------------------11136253119209';
      rm[16] = 'Content-Disposition: form-data;';
      rm[17] = '';
      rm[18] = '25';
      rm[19] = '-----------------------------11136253119209--';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Invalid formData parameter. ' +
                 'Data: \nContent-Disposit: form-data; name="Name"\n\nSmith\n'
      });
    });

    it('should throw Error when ContentType=multipart/form-data without and boundary parameter has invalid format', () => {
      let rm = _.cloneDeep(httpMsg);

      rm[11] = 'body';

      rm[8] = 'Content-Type: multipart/form-data';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Request with ContentType=FormData must have a header with boundary'
      });

      rm[8] = 'Content-Type: multipart/form-data; boundary';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Boundary param must have format: [boundary]=[value]. ' +
                 'Data: boundary'
      });

      rm[8] = 'Content-Type: multipart/form-data; boundary=';
      should(httpZ.parse.bind(null, rm.join('\n'))).throw(Error, {
        message: 'Boundary param must have format: [boundary]=[value]. ' +
                 'Data: boundary='
      });
    });

    it('should not throw Error when body is empty', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      ro.body = null;

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse valid body with ContentType=application/x-www-form-urlencoded', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      rm[8] = 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8';
      rm[11] = 'id=11&message=Hello';

      ro.headers[6].values = [{
        value: 'application/x-www-form-urlencoded',
        params: 'charset=UTF-8'
      }];
      ro.body = {
        contentType: 'application/x-www-form-urlencoded',
        formDataParams: [
          {
            name: 'id', value: '11' },
          {
            name: 'message', value: 'Hello' }
        ]
      };

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse valid body with ContentType=multipart/form-data', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      rm[8] = 'Content-Type: multipart/form-data; boundary=------11136253119209';
      rm[11] = '-----------------------------11136253119209';
      rm[12] = 'Content-Disposition: form-data; name="Name"';
      rm[13] = '';
      rm[14] = 'Smith';
      rm[15] = '-----------------------------11136253119209';
      rm[16] = 'Content-Disposition: form-data; name="Age"';
      rm[17] = '';
      rm[18] = '25';
      rm[19] = '-----------------------------11136253119209--';

      ro.headers[6].values = [{
        value: 'multipart/form-data',
        params: 'boundary=------11136253119209'
      }];
      ro.body = {
        contentType: 'multipart/form-data',
        boundary: '------11136253119209',
        formDataParams: [
          {
            name: 'Name', value: 'Smith' },
          {
            name: 'Age', value: '25' }
        ]
      };

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse valid body with ContentType=application/json', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      rm[8] = 'Content-Type: application/json';
      rm[11] = '{{"p1": "v1"}, {"p2": "v2"}}';

      ro.headers[6].values = [{
        value: 'application/json',
        params: null
      }];
      ro.body = {
        contentType: 'application/json',
        json: '{{"p1": "v1"}, {"p2": "v2"}}'
      };

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });

    it('should parse valid body with ContentType=text/plain', () => {
      let rm = _.cloneDeep(httpMsg);
      let ro = _.cloneDeep(httpObj);

      rm[8] = 'Content-Type: text/plain';
      rm[11] = 'Plain text';

      ro.headers[6].values = [{
        value: 'text/plain',
        params: null
      }];
      ro.body = {
        contentType: 'text/plain',
        plain: 'Plain text'
      };

      let actual = httpZ.parse(rm.join('\n'));
      should(actual).eql(ro);
    });
  });
});
