'use strict';

const _      = require('lodash');
const should = require('should');
const httpZ  = require('../../');

describe('builders / base', () => {
  describe('start-row', () => {
    let httpModel = {
      method: 'GET',
      protocol: 'HTTP',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
      path: '/features',
      params: { p1: 'v1' },
      headers: [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive' }
          ]
        }
      ]
    };

    let httpMsg = [
      'GET http://example.com/features?p1=v1 HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      ''
    ];

    it('should throw error when method or path or protocol or protocolVersion are empty', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.method = null;
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Unknown message format'
      });

      httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.path = null;
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'path must be not empty string'
      });

      httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.protocol = null;
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'protocol must be not empty string'
      });

      httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.protocolVersion = null;
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'protocolVersion must be not empty string'
      });
    });

    it('should build start-row when method and path and protocol and protocolVersion aren\'t empty', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      let httpMsgClone = _.cloneDeep(httpMsg);

      let actual = httpZ.build(httpModelClone);
      should(actual).eql(httpMsgClone.join('\n'));
    });
  });

  describe('host-row', () => {
    let httpModel = {
      method: 'GET',
      protocol: 'HTTP',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
      path: '/features',
      params: { p1: 'v1' },
      headers: [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive' }
          ]
        }
      ]
    };

    let httpMsg = [
      'GET http://example.com/features?p1=v1 HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      ''
    ];

    it('should build host-row', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      let httpMsgClone = _.cloneDeep(httpMsg);

      let actual = httpZ.build(httpModelClone);
      should(actual).eql(httpMsgClone.join('\n'));
    });
  });

  describe('headers', () => {
    let httpModel = {
      method: 'GET',
      protocol: 'HTTP',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
      path: '/features',
      params: { p1: 'v1' },
      headers: [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive' }
          ]
        },
        {
          name: 'Cache-Control',
          values: [
            { value: 'no-cache' }
          ]
        },
        {
          name: 'User-Agent',
          values: [
            { value: 'Mozilla/5.0 (Windows NT 6.1 WOW64)' }
          ]
        },
        {
          name: 'Accept',
          values: [
            { value: '*/*' },
            { value: 'text/plain' }
          ]
        },
        {
          name: 'Accept-Encoding',
          values: [
            { value: 'gzip' },
            { value: 'deflate' }
          ]
        },
        {
          name: 'Accept-Language',
          values: [
            { value: 'ru-RU' },
            { value: 'ru', params: 'q=0.8' },
            { value: 'en-US', params: 'q=0.6' },
            { value: 'en', params: 'q=0.4' }
          ]
        }
      ]
    };

    let httpMsg = [
      'GET http://example.com/features?p1=v1 HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'User-Agent: Mozilla/5.0 (Windows NT 6.1 WOW64)',
      'Accept: */*, text/plain',
      'Accept-Encoding: gzip, deflate',
      'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
      ''
    ];

    it('should throw error when headers list is invalid', () => {
      let httpModelClone = _.cloneDeep(httpModel);

      httpModelClone.headers = null;
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Headers must be array'
      });

      httpModelClone.headers = {};
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Headers must be array'
      });
    });

    it('should throw error when header is invalid', () => {
      let httpModelClone = _.cloneDeep(httpModel);

      httpModelClone.headers[0].name = null;
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Header name must be defined. ' +
                 'Data: ' + JSON.stringify(httpModelClone.headers[0])
      });

      httpModelClone = _.cloneDeep(httpModel);
      httpModelClone.headers[0].values = null;
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Header values must be defined. ' +
                 'Data: ' + JSON.stringify(httpModelClone.headers[0])
      });

      httpModelClone.headers[0].values = {};
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Header values must be defined. ' +
                 'Data: ' + JSON.stringify(httpModelClone.headers[0])
      });

      httpModelClone.headers[0].values = [];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Header values must be defined. ' +
                 'Data: ' + JSON.stringify(httpModelClone.headers[0])
      });

      httpModelClone.headers[0].values = [
        { value: 'keep-alive' },
        { value: null }
      ];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Header value must be defined. ' +
                 'Data: ' + JSON.stringify(httpModelClone.headers[0])
      });
    });

    it('should build header-rows when headers list is valid', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      let httpMsgClone = _.cloneDeep(httpMsg);

      let actual = httpZ.build(httpModelClone);
      should(actual).eql(httpMsgClone.join('\n'));
    });
  });

  describe('cookies', () => {
    let httpModel = {
      method: 'GET',
      protocol: 'HTTP',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
      path: '/features',
      params: { p1: 'v1' },
      headers: [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive' }
          ]
        },
        {
          name: 'Cache-Control',
          values: [
            { value: 'no-cache' }
          ]
        },
        {
          name: 'User-Agent',
          values: [
            { value: 'Mozilla/5.0 (Windows NT 6.1 WOW64)' }
          ]
        },
        {
          name: 'Accept',
          values: [
            { value: '*/*' }
          ]
        },
        {
          name: 'Accept-Encoding',
          values: [
            { value: 'gzip' },
            { value: 'deflate' }
          ]
        },
        {
          name: 'Accept-Language',
          values: [
            { value: 'ru-RU' },
            { value: 'ru', params: 'q=0.8' },
            { value: 'en-US', params: 'q=0.6' },
            { value: 'en', params: 'q=0.4' }
          ]
        }
      ],
      cookies: [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '456def' }
      ]
    };

    let httpMsg = [
      'GET http://example.com/features?p1=v1 HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'User-Agent: Mozilla/5.0 (Windows NT 6.1 WOW64)',
      'Accept: */*',
      'Accept-Encoding: gzip, deflate',
      'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
      'Cookie: csrftoken=123abc; sessionid=456def',
      ''
    ];

    it('should throw error when cookies has invalid type', () => {
      let httpModelClone = _.cloneDeep(httpModel);

      httpModelClone.cookies = [];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Cookies must be not empty array'
      });

      httpModelClone.cookies = {};
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Cookies must be not empty array'
      });
    });

    it('should throw error when cookies is invalid', () => {
      let httpModelClone = _.cloneDeep(httpModel);

      httpModelClone.cookies = [
        { name: '', value: '123abc' },
        { name: 'sessionid', value: '456def' }
      ];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Cookie name and value must be defined. ' +
                 'Data: ' + JSON.stringify(httpModelClone.cookies[0])
      });

      httpModelClone.cookies = [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '' }
      ];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Cookie name and value must be defined. ' +
                 'Data: ' + JSON.stringify(httpModelClone.cookies[1])
      });
    });

    it('should not throw Error when cookies is empty', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpModelClone.cookies = null;
      httpMsgClone.splice(8, 1);

      let actual = httpZ.build(httpModelClone);
      actual.should.be.eql(httpMsgClone.join('\n'));
    });

    it('should build cookie-row when cookies is valid', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      let httpMsgClone = _.cloneDeep(httpMsg);

      let actual = httpZ.build(httpModelClone);
      actual.should.be.eql(httpMsgClone.join('\n'));
    });
  });

  describe('body', () => {
    let httpModel = {
      method: 'GET',
      protocol: 'HTTP',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
      path: '/features',
      headers: [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive' }
          ]
        },
        {
          name: 'Cache-Control',
          values: [
            { value: 'no-cache' }
          ]
        },
        {
          name: 'User-Agent',
          values: [
            { value: 'Mozilla/5.0 (Windows NT 6.1 WOW64)' }
          ]
        },
        {
          name: 'Accept',
          values: [
            { value: '*/*' }
          ]
        },
        {
          name: 'Accept-Encoding',
          values: [
            { value: 'gzip' },
            { value: 'deflate' }
          ]
        },
        {
          name: 'Accept-Language',
          values: [
            { value: 'ru-RU' },
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
            { value: '301' }
          ]
        }
      ]
    };

    let httpMsg = [
      'GET http://example.com/features HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'User-Agent: Mozilla/5.0 (Windows NT 6.1 WOW64)',
      'Accept: */*',
      'Accept-Encoding: gzip, deflate',
      'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
      'Content-Type: application/x-www-form-urlencoded;charset=UTF-8',
      'Content-Length: 301',
      ''
    ];

    it('should throw error when ContentType=application/x-www-form-urlencoded and formDataParams list is empty or invalid type ', () => {
      let httpModelClone = _.cloneDeep(httpModel);

      httpModelClone.headers[6].values = [{
        value: 'application/x-www-form-urlencoded'
      }];
      httpModelClone.body = {
        contentType: 'application/x-www-form-urlencoded',
      };

      httpModelClone.body.formDataParams = null;
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Body with ContentType=application/x-www-form-urlencoded must have parameters'
      });

      httpModelClone.body.formDataParams = {};
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Body with ContentType=application/x-www-form-urlencoded must have parameters'
      });

      httpModelClone.body.formDataParams = [];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Body with ContentType=application/x-www-form-urlencoded must have parameters'
      });
    });

    it('should throw error when ContentType=application/x-www-form-urlencoded and formDataParams list is invalid', () => {
      let httpModelClone = _.cloneDeep(httpModel);

      httpModelClone.headers[6].values = [{
        value: 'application/x-www-form-urlencoded'
      }];
      httpModelClone.body = {
        contentType: 'application/x-www-form-urlencoded',
      };

      httpModelClone.body.formDataParams = [
        { name: '', value: '11' },
        { name: 'message', value: 'Hello' }
      ];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'FormData parameter must have name and value. ' +
                 'Data: ' + JSON.stringify(httpModelClone.body.formDataParams[0])
      });

      httpModelClone.body.formDataParams = [
        { name: '', value: '11' },
        { name: 'message', value: '' }
      ];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'FormData parameter must have name and value. ' +
                 'Data: ' + JSON.stringify(httpModelClone.body.formDataParams[0])
      });
    });

    it('should throw error when ContentType=multipart/form-data and boundary is empty', () => {
      let httpModelClone = _.cloneDeep(httpModel);

      httpModelClone.headers[6].values = [{
        value: 'multipart/form-data'
      }];
      httpModelClone.body = {
        contentType: 'multipart/form-data',
        formDataParams: [
          { name: '', value: '11' },
          { name: 'message', value: 'Hello' }
        ]
      };
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Body with ContentType=multipart/form-data must have boundary'
      });
    });

    it('should throw error when ContentType=multipart/form-data and formDataParams list is empty or invalid type', () => {
      let httpModelClone = _.cloneDeep(httpModel);

      httpModelClone.headers[6].values = [{
        value: 'multipart/form-data',
        params: 'boundary=------11136253119209'
      }];
      httpModelClone.body = {
        contentType: 'multipart/form-data',
        boundary: '------11136253119209'
      };

      httpModelClone.body.formDataParams = null;
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Body with ContentType=multipart/form-data must have parameters'
      });

      httpModelClone.body.formDataParams = {};
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Body with ContentType=multipart/form-data must have parameters'
      });

      httpModelClone.body.formDataParams = [];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'Body with ContentType=multipart/form-data must have parameters'
      });
    });

    it('should throw error when ContentType=multipart/form-data and formDataParams list is invalid', () => {
      let httpModelClone = _.cloneDeep(httpModel);

      httpModelClone.headers[6].values = [{
        value: 'multipart/form-data',
        params: 'boundary=------11136253119209'
      }];
      httpModelClone.body = {
        contentType: 'multipart/form-data',
        boundary: '------11136253119209'
      };

      httpModelClone.body.formDataParams = [
        { name: '', value: '11' },
        { name: 'message', value: 'Hello' }
      ];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'FormData parameter must have name and value. ' +
                 'Data: ' + JSON.stringify(httpModelClone.body.formDataParams[0])
      });

      httpModelClone.body.formDataParams = [
        { name: '', value: '11' },
        { name: 'message', value: '' }
      ];
      should(httpZ.build.bind(null, httpModelClone)).throw(Error, {
        message: 'FormData parameter must have name and value. ' +
                 'Data: ' + JSON.stringify(httpModelClone.body.formDataParams[0])
      });
    });

    it('should build body when ContentType=application/x-www-form-urlencoded', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      let httpMsgClone = _.cloneDeep(httpMsg);

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

      httpMsgClone[11] = 'id=11&message=Hello';

      let actual = httpZ.build(httpModelClone);
      actual.should.be.eql(httpMsgClone.join('\n'));
    });

    it('should build body when ContentType=multipart/form-data', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpModelClone.headers[6].values = [{
        value: 'multipart/form-data',
        params: 'boundary=------11136253119209'
      }];
      httpModelClone.body = {
        contentType: 'multipart/form-data',
        boundary: '------11136253119209',
        formDataParams: [
          { name: 'Name', value: 'Ivanov' },
          { name: 'Age', value: '25' }
        ]
      };

      httpMsgClone[8] = 'Content-Type: multipart/form-data;boundary=------11136253119209';
      httpMsgClone[11] = '-----------------------------11136253119209';
      httpMsgClone[12] = 'Content-Disposition: form-data; name="Name"';
      httpMsgClone[13] = '';
      httpMsgClone[14] = 'Ivanov';
      httpMsgClone[15] = '-----------------------------11136253119209';
      httpMsgClone[16] = 'Content-Disposition: form-data; name="Age"';
      httpMsgClone[17] = '';
      httpMsgClone[18] = '25';
      httpMsgClone[19] = '-----------------------------11136253119209--';

      let actual = httpZ.build(httpModelClone);
      actual.should.be.eql(httpMsgClone.join('\n'));
    });

    it('should build body when ContentType=application/json', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpModelClone.headers[6].values = [{
        value: 'application/json'
      }];
      httpModelClone.body = {
        contentType: 'application/json',
        json: { p1: 'v1', p2: 'v2' }
      };

      httpMsgClone[8] = 'Content-Type: application/json';
      httpMsgClone[11] = '{"p1":"v1","p2":"v2"}';

      let actual = httpZ.build(httpModelClone);
      actual.should.be.eql(httpMsgClone.join('\n'));
    });

    it('should build body when ContentType=text/plain', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpModelClone.headers[6].values = [{
        value: 'text/plain'
      }];
      httpModelClone.body = {
        contentType: 'text/plain',
        plain: 'Plain text'
      };

      httpMsgClone[8] = 'Content-Type: text/plain';
      httpMsgClone[11] = 'Plain text';

      let actual = httpZ.build(httpModelClone);
      actual.should.be.eql(httpMsgClone.join('\n'));
    });

    it('should build body when ContentType=text/plain and cookie is not empty', () => {
      let httpModelClone = _.cloneDeep(httpModel);
      let httpMsgClone = _.cloneDeep(httpMsg);

      httpModelClone.headers[6].values = [{
        value: 'text/plain'
      }];
      httpModelClone.cookies = [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '456def' }
      ];
      httpModelClone.body = {
        contentType: 'text/plain',
        plain: 'Plain text'
      };

      httpMsgClone[8] = 'Content-Type: text/plain';
      httpMsgClone[10] = 'Cookie: csrftoken=123abc; sessionid=456def';
      httpMsgClone[12] = 'Plain text';

      let actual = httpZ.build(httpModelClone);
      actual.should.be.eql(httpMsgClone.join('\n'));
    });
  });
});
