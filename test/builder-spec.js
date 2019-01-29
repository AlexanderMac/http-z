'use strict';

const _      = require('lodash');
const should = require('should');
const httpZ  = require('../');

describe('build()', () => {
  describe('httpObj', () => {
    it('should throw error when httpObj is undefined', () => {
      should(httpZ.build.bind(httpZ, null)).throw(Error, {
        message: 'httpObj must be defined'
      });
    });
  });

  describe('start-line', () => {
    let httpObj = {
      method: 'GET',
      protocol: 'HTTP',
      url: 'app.com/features?p1=v1',
      protocolVersion: 'HTTP/1.1',
      host: 'app.com',
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
      'GET http://app.com/features?p1=v1 HTTP/1.1',
      'HOST: app.com',
      'Connection: keep-alive',
      '',
      ''
    ];

    it('should throw Error when method or url or protocol or protocolVersion are empty', () => {
      let ro = _.cloneDeep(httpObj);
      ro.method = null;
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Method must be defined'
      });

      ro = _.cloneDeep(httpObj);
      ro.url = null;
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Url must be defined'
      });

      ro = _.cloneDeep(httpObj);
      ro.protocol = null;
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Protocol must be defined'
      });

      ro = _.cloneDeep(httpObj);
      ro.protocolVersion = null;
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'ProtocolVersion must be defined'
      });
    });

    it('should build start-line when method and url and protocol and protocolVersion aren\'t empty', () => {
      let ro = _.cloneDeep(httpObj);
      let rm = _.cloneDeep(httpMsg);

      let actual = httpZ.build(ro);
      should(actual).eql(rm.join('\n'));
    });
  });

  describe('host-line', () => {
    let httpObj = {
      method: 'GET',
      protocol: 'HTTP',
      url: 'app.com/features?p1=v1',
      protocolVersion: 'HTTP/1.1',
      host: 'app.com',
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
      'GET http://app.com/features?p1=v1 HTTP/1.1',
      'HOST: app.com',
      'Connection: keep-alive',
      '',
      ''
    ];

    it('should build host-line when url is valid', () => {
      let ro = _.cloneDeep(httpObj);
      let rm = _.cloneDeep(httpMsg);

      ro.url = '/app.com/features?p1=v1';
      rm[1] = 'HOST: app.com';
      let actual = httpZ.build(ro);
      should(actual).eql(rm.join('\n'));

      ro.url = '//app.com/features?p1=v1';
      rm[1] = 'HOST: app.com';
      actual = httpZ.build(ro);
      should(actual).eql(rm.join('\n'));

      ro.url = 'www.app.com/features?p1=v1';
      rm[0] = 'GET http://www.app.com/features?p1=v1 HTTP/1.1',
      rm[1] = 'HOST: app.com';
      actual = httpZ.build(ro);
      should(actual).eql(rm.join('\n'));
    });
  });

  describe('headers', () => {
    let httpObj = {
      method: 'GET',
      protocol: 'HTTP',
      url: 'app.com/features?p1=v1',
      protocolVersion: 'HTTP/1.1',
      host: 'app.com',
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
      'GET http://app.com/features?p1=v1 HTTP/1.1',
      'HOST: app.com',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'User-Agent: Mozilla/5.0 (Windows NT 6.1 WOW64)',
      'Accept: */*, text/plain',
      'Accept-Encoding: gzip, deflate',
      'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
      '',
      ''
    ];

    it('should throw Error when headers list is empty or invalid', () => {
      let ro = _.cloneDeep(httpObj);

      ro.headers = null;
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Headers must be defined'
      });

      ro.headers = {};
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Headers must be defined'
      });

      ro.headers = [];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Headers must be defined'
      });
    });

    it('should throw Error when header is invalid', () => {
      let ro = _.cloneDeep(httpObj);

      ro.headers[0].name = null;
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Header name must be defined. ' +
                 'Data: ' + JSON.stringify(ro.headers[0])
      });

      ro = _.cloneDeep(httpObj);
      ro.headers[0].values = null;
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Header values must be defined. ' +
                 'Data: ' + JSON.stringify(ro.headers[0])
      });

      ro.headers[0].values = {};
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Header values must be defined. ' +
                 'Data: ' + JSON.stringify(ro.headers[0])
      });

      ro.headers[0].values = [];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Header values must be defined. ' +
                 'Data: ' + JSON.stringify(ro.headers[0])
      });

      ro.headers[0].values = [
        { value: 'keep-alive' },
        { value: null }
      ];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Header value must be defined. ' +
                 'Data: ' + JSON.stringify(ro.headers[0])
      });
    });

    it('should build header-lines when headers list is valid', () => {
      let ro = _.cloneDeep(httpObj);
      let rm = _.cloneDeep(httpMsg);

      let actual = httpZ.build(ro);
      should(actual).eql(rm.join('\n'));
    });
  });

  describe('cookies', () => {
    let httpObj = {
      method: 'GET',
      protocol: 'HTTP',
      url: 'app.com/features?p1=v1',
      protocolVersion: 'HTTP/1.1',
      host: 'app.com',
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
      'GET http://app.com/features?p1=v1 HTTP/1.1',
      'HOST: app.com',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'User-Agent: Mozilla/5.0 (Windows NT 6.1 WOW64)',
      'Accept: */*',
      'Accept-Encoding: gzip, deflate',
      'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
      'Cookie: csrftoken=123abc; sessionid=456def',
      '',
      ''
    ];

    it('should throw Error when cookies has invalid type', () => {
      let ro = _.cloneDeep(httpObj);

      ro.cookies = [];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Cookie name-value pairs must be defined'
      });

      ro.cookies = {};
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Cookie name-value pairs must be defined'
      });
    });

    it('should throw Error when cookies is invalid', () => {
      let ro = _.cloneDeep(httpObj);

      ro.cookies = [
        { name: '', value: '123abc' },
        { name: 'sessionid', value: '456def' }
      ];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Cookie name or value must be defined. ' +
                 'Data: ' + JSON.stringify(ro.cookies[0])
      });

      ro.cookies = [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '' }
      ];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Cookie name or value must be defined. ' +
                 'Data: ' + JSON.stringify(ro.cookies[1])
      });
    });

    it('should not throw Error when cookies is empty', () => {
      let ro = _.cloneDeep(httpObj);
      let rm = _.cloneDeep(httpMsg);

      ro.cookies = null;
      rm.splice(8, 1);

      let actual = httpZ.build(ro);
      actual.should.be.eql(rm.join('\n'));
    });

    it('should build cookie-line when cookies is valid', () => {
      let ro = _.cloneDeep(httpObj);
      let rm = _.cloneDeep(httpMsg);

      let actual = httpZ.build(ro);
      actual.should.be.eql(rm.join('\n'));
    });
  });

  describe('body', () => {
    let httpObj = {
      method: 'GET',
      protocol: 'HTTP',
      url: 'app.com/features?p1=v1',
      protocolVersion: 'HTTP/1.1',
      host: 'app.com',
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
      'GET http://app.com/features?p1=v1 HTTP/1.1',
      'HOST: app.com',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'User-Agent: Mozilla/5.0 (Windows NT 6.1 WOW64)',
      'Accept: */*',
      'Accept-Encoding: gzip, deflate',
      'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
      'Content-Type: application/x-www-form-urlencoded;charset=UTF-8',
      'Content-Length: 301',
      '',
      ''
    ];

    it('should throw Error when ContentType=application/x-www-form-urlencoded and formDataParams list is empty or invalid type ', () => {
      let ro = _.cloneDeep(httpObj);

      ro.headers[6].values = [{
        value: 'application/x-www-form-urlencoded'
      }];
      ro.body = {
        contentType: 'application/x-www-form-urlencoded',
      };

      ro.body.formDataParams = null;
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Body with ContentType=application/x-www-form-urlencoded must have parameters'
      });

      ro.body.formDataParams = {};
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Body with ContentType=application/x-www-form-urlencoded must have parameters'
      });

      ro.body.formDataParams = [];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Body with ContentType=application/x-www-form-urlencoded must have parameters'
      });
    });

    it('should throw Error when ContentType=application/x-www-form-urlencoded and formDataParams list is invalid', () => {
      let ro = _.cloneDeep(httpObj);

      ro.headers[6].values = [{
        value: 'application/x-www-form-urlencoded'
      }];
      ro.body = {
        contentType: 'application/x-www-form-urlencoded',
      };

      ro.body.formDataParams = [
        { name: '', value: '11' },
        { name: 'message', value: 'Hello' }
      ];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'FormData parameter must have name and value. ' +
                 'Data: ' + JSON.stringify(ro.body.formDataParams[0])
      });

      ro.body.formDataParams = [
        { name: '', value: '11' },
        { name: 'message', value: '' }
      ];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'FormData parameter must have name and value. ' +
                 'Data: ' + JSON.stringify(ro.body.formDataParams[0])
      });
    });

    it('should throw Error when ContentType=multipart/form-data and boundary is empty', () => {
      let ro = _.cloneDeep(httpObj);

      ro.headers[6].values = [{
        value: 'multipart/form-data'
      }];
      ro.body = {
        contentType: 'multipart/form-data',
        formDataParams: [
          { name: '', value: '11' },
          { name: 'message', value: 'Hello' }
        ]
      };
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Body with ContentType=multipart/form-data must have boundary in ContentType header'
      });
    });

    it('should throw Error when ContentType=multipart/form-data and formDataParams list is empty or invalid type', () => {
      let ro = _.cloneDeep(httpObj);

      ro.headers[6].values = [{
        value: 'multipart/form-data',
        params: 'boundary=------11136253119209'
      }];
      ro.body = {
        contentType: 'multipart/form-data',
        boundary: '------11136253119209'
      };

      ro.body.formDataParams = null;
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Body with ContentType=multipart/form-data must have parameters'
      });

      ro.body.formDataParams = {};
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Body with ContentType=multipart/form-data must have parameters'
      });

      ro.body.formDataParams = [];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'Body with ContentType=multipart/form-data must have parameters'
      });
    });

    it('should throw Error when ContentType=multipart/form-data and formDataParams list is invalid', () => {
      let ro = _.cloneDeep(httpObj);

      ro.headers[6].values = [{
        value: 'multipart/form-data',
        params: 'boundary=------11136253119209'
      }];
      ro.body = {
        contentType: 'multipart/form-data',
        boundary: '------11136253119209'
      };

      ro.body.formDataParams = [
        { name: '', value: '11' },
        { name: 'message', value: 'Hello' }
      ];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'FormData parameter must have name and value. ' +
                 'Data: ' + JSON.stringify(ro.body.formDataParams[0])
      });

      ro.body.formDataParams = [
        { name: '', value: '11' },
        { name: 'message', value: '' }
      ];
      should(httpZ.build.bind(null, ro)).throw(Error, {
        message: 'FormData parameter must have name and value. ' +
                 'Data: ' + JSON.stringify(ro.body.formDataParams[0])
      });
    });

    it('should build body when ContentType=application/x-www-form-urlencoded', () => {
      let ro = _.cloneDeep(httpObj);
      let rm = _.cloneDeep(httpMsg);

      ro.headers[6].values = [{
        value: 'application/x-www-form-urlencoded',
        params: 'charset=UTF-8'
      }];
      ro.body = {
        contentType: 'application/x-www-form-urlencoded',
        formDataParams: [
          { name: 'id', value: '11' },
          { name: 'message', value: 'Hello' }
        ]
      };

      rm[11] = 'id=11&message=Hello';

      let actual = httpZ.build(ro);
      actual.should.be.eql(rm.join('\n'));
    });

    it('should build body when ContentType=multipart/form-data', () => {
      let ro = _.cloneDeep(httpObj);
      let rm = _.cloneDeep(httpMsg);

      ro.headers[6].values = [{
        value: 'multipart/form-data',
        params: 'boundary=------11136253119209'
      }];
      ro.body = {
        contentType: 'multipart/form-data',
        boundary: '------11136253119209',
        formDataParams: [
          { name: 'Name', value: 'Ivanov' },
          { name: 'Age', value: '25' }
        ]
      };

      rm[8] = 'Content-Type: multipart/form-data;boundary=------11136253119209';
      rm[11] = '-----------------------------11136253119209';
      rm[12] = 'Content-Disposition: form-data; name="Name"';
      rm[13] = '';
      rm[14] = 'Ivanov';
      rm[15] = '-----------------------------11136253119209';
      rm[16] = 'Content-Disposition: form-data; name="Age"';
      rm[17] = '';
      rm[18] = '25';
      rm[19] = '-----------------------------11136253119209--';

      let actual = httpZ.build(ro);
      actual.should.be.eql(rm.join('\n'));
    });

    it('should build body when ContentType=application/json', () => {
      let ro = _.cloneDeep(httpObj);
      let rm = _.cloneDeep(httpMsg);

      ro.headers[6].values = [{
        value: 'application/json'
      }];
      ro.body = {
        contentType: 'application/json',
        json: '{{"p1": "v1"}, {"p2": "v2"}}'
      };

      rm[8] = 'Content-Type: application/json';
      rm[11] = '{{"p1": "v1"}, {"p2": "v2"}}';

      let actual = httpZ.build(ro);
      actual.should.be.eql(rm.join('\n'));
    });

    it('should build body when ContentType=text/plain', () => {
      let ro = _.cloneDeep(httpObj);
      let rm = _.cloneDeep(httpMsg);

      ro.headers[6].values = [{
        value: 'text/plain'
      }];
      ro.body = {
        contentType: 'text/plain',
        plain: 'Plain text'
      };

      rm[8] = 'Content-Type: text/plain';
      rm[11] = 'Plain text';

      let actual = httpZ.build(ro);
      actual.should.be.eql(rm.join('\n'));
    });

    it('should build body when ContentType=text/plain and cookie is not empty', () => {
      let ro = _.cloneDeep(httpObj);
      let rm = _.cloneDeep(httpMsg);

      ro.headers[6].values = [{
        value: 'text/plain'
      }];
      ro.cookies = [
        { name: 'csrftoken', value: '123abc' },
        { name: 'sessionid', value: '456def' }
      ];
      ro.body = {
        contentType: 'text/plain',
        plain: 'Plain text'
      };

      rm[8] = 'Content-Type: text/plain';
      rm[10] = 'Cookie: csrftoken=123abc; sessionid=456def';
      rm[12] = 'Plain text';

      let actual = httpZ.build(ro);
      actual.should.be.eql(rm.join('\n'));
    });
  });
});
