const _ = require('lodash');
const sinon = require('sinon');
const should = require('should');
const nassert = require('n-assert');
const HttpZError = require('../../src/error');
const BaseBuilder = require('../../src/builders/base');

describe('builders / base', () => {
  function getBuilderInstance(params) {
    return new BaseBuilder(params);
  }

  describe('_generateHeaderRows', () => {
    function getDefaultHeaders() {
      return [
        {
          name: 'Connection',
          values: []
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
            { value: 'en-US', params: 'q=0.6' },
            { value: 'en', params: 'q=0.4' }
          ]
        }
      ];
    }

    it('should throw error when instance.headers is nil', () => {
      let headers;
      let expected = HttpZError.get('headers is required');

      let builder = getBuilderInstance({ headers });
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.headers is not an array', () => {
      let headers = 'headers';
      let expected = HttpZError.get('headers must be an array');

      let builder = getBuilderInstance({ headers });
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.headers contains header without name', () => {
      let headers = getDefaultHeaders();
      headers[1].name = undefined;
      let expected = HttpZError.get('header name is required', 'header index: 1');

      let builder = getBuilderInstance({ headers });
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.headers contains header without values', () => {
      let headers = getDefaultHeaders();
      headers[2].values = undefined;
      let expected = HttpZError.get('header.values is required', 'header index: 2');

      let builder = getBuilderInstance({ headers });
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.headers contains header with values that is not array', () => {
      let headers = getDefaultHeaders();
      headers[2].values = 'values';
      let expected = HttpZError.get('header.values must be an array', 'header index: 2');

      let builder = getBuilderInstance({ headers });
      should(builder._generateHeaderRows.bind(builder)).throw(HttpZError, expected);
    });

    it('should return \n when instance.headers is an empty array', () => {
      let headers = [];
      let expected = '\n';

      let builder = getBuilderInstance({ headers });
      let actual = builder._generateHeaderRows();
      should(actual).eql(expected);
    });

    it('should return headerRows when instance.headers is non empty array', () => {
      let headers = getDefaultHeaders();
      let expected = [
        'Connection: ',
        'Accept: */*, text/plain',
        'Accept-Encoding: gzip, deflate',
        'Accept-Language: en-US;q=0.6, en;q=0.4',
        ''
      ].join('\n');

      let builder = getBuilderInstance({ headers });
      let actual = builder._generateHeaderRows();
      should(actual).eql(expected);
    });
  });

  describe('_generateBodyRows', () => {
    function test({ body, expected, expectedFnArgs = {}}) {
      let builder = getBuilderInstance({ body });
      sinon.stub(builder, '_generateFormDataBody').returns('FormDataBody');
      sinon.stub(builder, '_generateXwwwFormUrlencodedBody').returns('XwwwFormUrlencodedBody');
      sinon.stub(builder, '_generateJsonBody').returns('JsonBody');
      sinon.stub(builder, '_generatePlainBody').returns('PlainBody');

      if (!_.isError(expected)) {
        let actual = builder._generateBodyRows();
        should(actual).eql(expected);
      } else {
        should(builder._generateBodyRows.bind(builder)).throw(HttpZError, expected);
      }

      nassert.assertFn({ inst: builder, fnName: '_generateFormDataBody', expectedArgs: expectedFnArgs.genFormDataBody });
      nassert.assertFn({ inst: builder, fnName: '_generateXwwwFormUrlencodedBody', expectedArgs: expectedFnArgs.genXwwwFormUrlencodedBody });
      nassert.assertFn({ inst: builder, fnName: '_generateJsonBody', expectedArgs: expectedFnArgs.genJsonBody });
      nassert.assertFn({ inst: builder, fnName: '_generatePlainBody', expectedArgs: expectedFnArgs.genPlainBody });
    }

    it('should return empty string when instance.body is nil', () => {
      let body;
      let expected = '';

      test({ body, expected });
    });

    it('should return FormDataBody when instance.body is not empty and contentType is multipart/form-data', () => {
      let body = {
        contentType: 'multipart/form-data'
      };
      let expected = '\nFormDataBody';
      let expectedFnArgs = { genFormDataBody: '_without-args_' };

      test({ body, expected, expectedFnArgs });
    });

    it('should return XwwwFormUrlencodedBody when instance.body is not empty and contentType is application/x-www-form-urlencoded', () => {
      let body = {
        contentType: 'application/x-www-form-urlencoded'
      };
      let expected = '\nXwwwFormUrlencodedBody';
      let expectedFnArgs = { genXwwwFormUrlencodedBody: '_without-args_' };

      test({ body, expected, expectedFnArgs });
    });

    it('should return JsonBody when instance.body is not empty and contentType is application/json', () => {
      let body = {
        contentType: 'application/json'
      };
      let expected = '\nJsonBody';
      let expectedFnArgs = { genJsonBody: '_without-args_' };

      test({ body, expected, expectedFnArgs });
    });

    it('should return PlainBody when instance.body is not empty and contentType is text/plain', () => {
      let body = {
        contentType: 'text/plain'
      };
      let expected = '\nPlainBody';
      let expectedFnArgs = { genPlainBody: '_without-args_' };

      test({ body, expected, expectedFnArgs });
    });

    it('should return PlainBody when instance.body is not empty and contentType is unsupported', () => {
      let body = {
        contentType: 'unsupported'
      };
      let expected = '\nPlainBody';
      let expectedFnArgs = { genPlainBody: '_without-args_' };

      test({ body, expected, expectedFnArgs });
    });
  });

  describe('_generateFormDataBody', () => {
    function getDefaultBody() {
      return {
        formDataParams: [
          { name: 'firstName', value: 'John' },
          { name: 'lastName', value: 'Smith' },
          { name: 'age', value: '' }
        ],
        boundary: '11136253119209'
      };
    }

    it('should throw error when instance.body.formDataParams is nil', () => {
      let body = getDefaultBody();
      body.formDataParams = undefined;
      let expected = HttpZError.get('body.formDataParams is required');

      let builder = getBuilderInstance({ body });
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.body.formDataParams is not array', () => {
      let body = getDefaultBody();
      body.formDataParams = 'params';
      let expected = HttpZError.get('body.formDataParams must be an array');

      let builder = getBuilderInstance({ body });
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.body.formDataParams is an empty array', () => {
      let body = getDefaultBody();
      body.formDataParams = [];
      let expected = HttpZError.get('body.formDataParams must be not empty array');

      let builder = getBuilderInstance({ body });
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.body.boundary is nil', () => {
      let body = getDefaultBody();
      body.boundary = undefined;
      let expected = HttpZError.get('body.boundary is required');

      let builder = getBuilderInstance({ body });
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.body.boundary is not a string', () => {
      let body = getDefaultBody();
      body.boundary = 12345;
      let expected = HttpZError.get('body.boundary must be a string');

      let builder = getBuilderInstance({ body });
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.body.boundary is empty string', () => {
      let body = getDefaultBody();
      body.boundary = '';
      let expected = HttpZError.get('body.boundary must be not empty string');

      let builder = getBuilderInstance({ body });
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.body.formDataParams contains param with empty name', () => {
      let body = getDefaultBody();
      body.formDataParams[0].name = '';
      let expected = HttpZError.get('body.formDataParams[index].name must be not empty string', 'dataParam index: 0');

      let builder = getBuilderInstance({ body });
      should(builder._generateFormDataBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should return BodyRows when instance.body is not empty and valid', () => {
      let body = getDefaultBody();
      let expected = [
        '--11136253119209',
        'Content-Disposition: form-data; name="firstName"',
        '',
        'John',
        '--11136253119209',
        'Content-Disposition: form-data; name="lastName"',
        '',
        'Smith',
        '--11136253119209',
        'Content-Disposition: form-data; name="age"',
        '',
        '',
        '--11136253119209--'
      ].join('\n');

      let builder = getBuilderInstance({ body });
      let actual = builder._generateFormDataBody();
      should(actual).eql(expected);
    });
  });

  describe('_generateXwwwFormUrlencodedBody', () => {
    function getDefaultBody() {
      return {
        formDataParams: [
          { name: 'firstName', value: 'John' },
          { name: 'lastName', value: 'Smith' },
          { name: 'age', value: '' }
        ]
      };
    }

    it('should throw error when instance.body.formDataParams is nil', () => {
      let body = getDefaultBody();
      body.formDataParams = undefined;
      let expected = HttpZError.get('body.formDataParams is required');

      let builder = getBuilderInstance({ body });
      should(builder._generateXwwwFormUrlencodedBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.body.formDataParams is not array', () => {
      let body = getDefaultBody();
      body.formDataParams = 'params';
      let expected = HttpZError.get('body.formDataParams must be an array');

      let builder = getBuilderInstance({ body });
      should(builder._generateXwwwFormUrlencodedBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.body.formDataParams is an empty array', () => {
      let body = getDefaultBody();
      body.formDataParams = [];
      let expected = HttpZError.get('body.formDataParams must be not empty array');

      let builder = getBuilderInstance({ body });
      should(builder._generateXwwwFormUrlencodedBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should throw error when instance.body.formDataParams contains param with empty name', () => {
      let body = getDefaultBody();
      body.formDataParams[0].name = '';
      let expected = HttpZError.get('body.formDataParams[index].name must be not empty string', 'dataParam index: 0');

      let builder = getBuilderInstance({ body });
      should(builder._generateXwwwFormUrlencodedBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should return BodyRows when instance.body is not empty and valid', () => {
      let body = getDefaultBody();
      let expected = 'firstName=John&lastName=Smith&age=';

      let builder = getBuilderInstance({ body });
      let actual = builder._generateXwwwFormUrlencodedBody();
      should(actual).eql(expected);
    });
  });

  describe('_generateJsonBody', () => {
    function getDefaultBody() {
      return {
        json: {
          name: 'Smith',
          age: 25
        }
      };
    }

    it('should throw error when instance.body.json is nil', () => {
      let body = getDefaultBody();
      body.json = undefined;
      let expected = HttpZError.get('body.json is required');

      let builder = getBuilderInstance({ body });
      should(builder._generateJsonBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should return BodyRows when instance.body is not empty and valid (body.json is a string)', () => {
      let body = getDefaultBody();
      body.json = 'some data';
      let expected = 'some data';

      let builder = getBuilderInstance({ body });
      let actual = builder._generateJsonBody();
      should(actual).eql(expected);
    });

    it('should return BodyRows when instance.body is not empty and valid', () => {
      let body = getDefaultBody();
      let expected = '{"name":"Smith","age":25}';

      let builder = getBuilderInstance({ body });
      let actual = builder._generateJsonBody();
      should(actual).eql(expected);
    });
  });

  describe('_generatePlainBody', () => {
    function getDefaultBody() {
      return {
        plain: 'plain data'
      };
    }

    it('should throw error when instance.body.plain is nil', () => {
      let body = getDefaultBody();
      body.plain = undefined;
      let expected = HttpZError.get('body.plain is required');

      let builder = getBuilderInstance({ body });
      should(builder._generatePlainBody.bind(builder)).throw(HttpZError, expected);
    });

    it('should return BodyRows when instance.body is not empty and valid', () => {
      let body = getDefaultBody();
      let expected = 'plain data';

      let builder = getBuilderInstance({ body });
      let actual = builder._generatePlainBody();
      should(actual).eql(expected);
    });
  });
});
