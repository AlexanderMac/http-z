const sinon = require('sinon');
const should = require('should');
const nassert = require('n-assert');
const HttpZError = require('../../src/error');
const BaseParser = require('../../src/parsers/base');

describe('parsers / base', () => {
  function getParserInstance(...params) {
    return new BaseParser(...params);
  }

  describe('_parseMessageForRows', () => {
    it('should throw error when message does not have headers', () => {
      let eol = '\n';
      let plainRequest = [
        '',
        'Body'
      ].join(eol);
      let parser = getParserInstance(plainRequest, eol);

      should(parser._parseMessageForRows.bind(parser)).throw(Error, {
        message: 'Incorrect message format, it must have headers and body, separated by empty line'
      });
    });

    it('should throw error when message does not have empty line and body', () => {
      let eol = '\n';
      let plainRequest = [
        'start-line',
        'host-line',
        'Header1'
      ].join(eol);
      let parser = getParserInstance(plainRequest, eol);

      should(parser._parseMessageForRows.bind(parser)).throw(HttpZError, {
        message: 'Incorrect message format, it must have headers and body, separated by empty line'
      });
    });

    function _testParseMessageWithoutBody(eol) {
      let plainRequest = [
        'start-line',
        'host-line',
        'Header1',
        'Header2',
        'Header3',
        'Cookie',
        ''
      ].join(eol);
      let parser = getParserInstance(plainRequest, eol);

      let actual = parser._parseMessageForRows();
      should(actual.startRow).eql('start-line');
      should(actual.headerRows).eql(['host-line', 'Header1', 'Header2', 'Header3', 'Cookie']);
      should(actual.bodyRows).eql(undefined);
    }

    it('should parse message for rows without body when eol is \n', () => {
      _testParseMessageWithoutBody('\n');
    });

    it('should parse message for rows without body when eol is \r\n', () => {
      _testParseMessageWithoutBody('\r\n');
    });

    function _testParseMessageWithBody(eol) {
      let plainRequest = [
        'start-line',
        'host-line',
        'Header1',
        'Header2',
        'Header3',
        'Cookie',
        '',
        'Body'
      ].join(eol);
      let parser = getParserInstance(plainRequest, eol);

      let actual = parser._parseMessageForRows();
      should(actual.startRow).eql('start-line');
      should(actual.headerRows).eql(['host-line', 'Header1', 'Header2', 'Header3', 'Cookie']);
      should(actual.bodyRows).eql('Body');
    }

    it('should parse message for rows with body when eol is \n', () => {
      _testParseMessageWithBody('\n');
    });

    it('should parse message for rows with body when eol is \r\n', () => {
      _testParseMessageWithBody('\r\n');
    });
  });

  describe('_parseHeaderRows', () => {
    it('should throw error when headerRow has invalid format', () => {
      let parser = getParserInstance();
      parser.headerRows = [
        'Header1: values',
        'Header2 - values',
        'Header3: values'
      ];

      should(parser._parseHeaderRows.bind(parser)).throw(HttpZError, {
        message: 'Incorrect header row format, expected: Name: Values',
        details: 'Header2 - values'
      });
    });

    it('should set instance.headers when headerRows are valid', () => {
      let parser = getParserInstance();
      parser.headerRows = [
        'Connection: ',
        'Accept: */*, text/plain',
        'accept-Encoding: gzip, deflate   ',
        'Accept-language: ru-RU, ru; q=0.8,en-US;q=0.6,en;  q=0.4'
      ];
      parser._parseHeaderRows();

      let expected = [
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
            { value: 'ru-RU' },
            { value: 'ru', params: 'q=0.8' },
            { value: 'en-US', params: 'q=0.6' },
            { value: 'en', params: 'q=0.4' }
          ]
        }
      ];
      should(parser.headers).eql(expected);
    });
  });

  describe('_parseBodyRows', () => {
    function test({ headers, bodyRows, expected, expectedFnArgs = {}}) {
      let parser = getParserInstance();
      sinon.stub(parser, '_parseFormDataBody').callsFake(() => parser.body.formDataParams = 'body');
      sinon.stub(parser, '_parseXwwwFormUrlencodedBody').callsFake(() => parser.body.formDataParams = 'body');
      sinon.stub(parser, '_parseJsonBody').callsFake(() => parser.body.json = 'body');
      sinon.stub(parser, '_parsePlainBody').callsFake(() => parser.body.plain = 'body');
      parser.headers = headers;
      parser.bodyRows = bodyRows;

      parser._parseBodyRows();
      should(parser.body).eql(expected);

      nassert.assertFn({ inst: parser, fnName: '_parseFormDataBody', expectedArgs: expectedFnArgs.parseFormDataBody });
      nassert.assertFn({ inst: parser, fnName: '_parseXwwwFormUrlencodedBody', expectedArgs: expectedFnArgs.parseXwwwFormUrlencodedBody });
      nassert.assertFn({ inst: parser, fnName: '_parseJsonBody', expectedArgs: expectedFnArgs.parseJsonBody });
      nassert.assertFn({ inst: parser, fnName: '_parsePlainBody', expectedArgs: expectedFnArgs.parsePlainBody });
    }

    it('should set instance.body to undefined when bodyRows is empty', () => {
      let bodyRows = undefined;
      let expected = undefined;

      test({ bodyRows, expected });
    });

    it('should set instance.body when bodyRows are valid and contentType header is multipart/form-data', () => {
      let headers = [{ name: 'Content-Type', values: [{ value: 'multipart/form-data' }] }];
      let bodyRows = 'body';
      let expected = {
        contentType: 'multipart/form-data',
        formDataParams: 'body'
      };
      let expectedFnArgs = { parseFormDataBody: '_without-args_' };

      test({ headers, bodyRows, expected, expectedFnArgs });
    });

    it('should set instance.body when bodyRows are valid and contentType header is application/x-www-form-urlencoded', () => {
      let headers = [{ name: 'Content-Type', values: [{ value: 'application/x-www-form-urlencoded' }] }];
      let bodyRows = 'body';
      let expected = {
        contentType: 'application/x-www-form-urlencoded',
        formDataParams: 'body'
      };
      let expectedFnArgs = { parseXwwwFormUrlencodedBody: '_without-args_' };

      test({ headers, bodyRows, expected, expectedFnArgs });
    });

    it('should set instance.body when bodyRows are valid and contentType header is application/json', () => {
      let headers = [{ name: 'Content-Type', values: [{ value: 'application/json' }] }];
      let bodyRows = 'body';
      let expected = {
        contentType: 'application/json',
        json: 'body'
      };
      let expectedFnArgs = { parseJsonBody: '_without-args_' };

      test({ headers, bodyRows, expected, expectedFnArgs });
    });

    it('should set instance.body when bodyRows are valid and contentType header is missing', () => {
      let bodyRows = 'body';
      let expected = {
        plain: 'body'
      };
      let expectedFnArgs = { parsePlainBody: '_without-args_' };

      test({ bodyRows, expected, expectedFnArgs });
    });
  });

  describe('_parseFormDataBody', () => {
    it('should throw error when some param has incorrect format', () => {
      let parser = getParserInstance();
      let eol = '\n';
      parser.eol = eol;
      parser.body = {};
      parser.headers = [{
        name: 'Content-Type',
        values: [
          { value: 'multipart/form-data', params: 'boundary=11136253119209' }
        ]
      }];
      parser.bodyRows = [
        '--11136253119209',
        'Content-Disposition: form-data; name="firstName"',
        '',
        'John',
        '--11136253119209',
        'Content-Disposition: form-data; name="age"',
        '25',
        '--11136253119209--'
      ].join(eol);

      should(parser._parseFormDataBody.bind(parser)).throw(HttpZError, {
        message: 'Incorrect form-data parameter',
        details: '\nContent-Disposition: form-data; name="age"\n25\n'
      });
    });

    it('should set instance.body when all params in body are valid', () => {
      let parser = getParserInstance();
      let eol = '\n';
      parser.eol = eol;
      parser.body = {};
      parser.headers = [{
        name: 'Content-Type',
        values: [
          { value: 'multipart/form-data', params: 'boundary=11136253119209' }
        ]
      }];
      parser.bodyRows = [
        '--11136253119209',
        'Content-Disposition: form-data; name="firstName"',
        '',
        'John',
        '--11136253119209',
        'Content-Disposition: form-data; name="age"',
        '',
        '',
        '--11136253119209--'
      ].join(eol);

      parser._parseFormDataBody();

      let expected = {
        boundary: '11136253119209',
        formDataParams: [
          { name: 'firstName', value: 'John' },
          { name: 'age', value: '' }
        ]
      };
      should(parser.body).eql(expected);
    });
  });

  describe('_parseXwwwFormUrlencodedBody', () => {
    it('should throw error when some param has incorrect format', () => {
      let parser = getParserInstance();
      parser.bodyRows = 'firstName=John&=Smith&age=25';

      should(parser._parseXwwwFormUrlencodedBody.bind(parser)).throw(HttpZError, {
        message: 'Incorrect x-www-form-urlencoded parameter, expected: Name="Value',
        details: '=Smith'
      });
    });

    it('should set instance.body when all params in body are valid', () => {
      let parser = getParserInstance();
      parser.body = {};
      parser.bodyRows = 'firstName=John&lastName=Smith&age=';

      parser._parseXwwwFormUrlencodedBody();

      let expected = {
        formDataParams: [
          { name: 'firstName', value: 'John' },
          { name: 'lastName', value: 'Smith' },
          { name: 'age', value: '' }
        ]
      };
      should(parser.body).eql(expected);
    });
  });

  describe('_parseJsonBody', () => {
    it('should parse body and throw error when json is invalid', () => {
      let parser = getParserInstance();
      parser.bodyRows = 'Incorrect json';

      should(parser._parseJsonBody.bind(parser)).throw(HttpZError, {
        message: 'Invalid json in body'
      });
    });

    it('should parse body and set instance.body to parsed object when json is valid', () => {
      let parser = getParserInstance();
      parser.body = {};
      parser.bodyRows = '{"name":"John"}';

      parser._parseJsonBody();

      let expected = {
        json: { name : 'John' }
      };
      should(parser.body).eql(expected);
    });
  });

  describe('_parsePlainBody', () => {
    it('should set instance.body using bodyRows', () => {
      let parser = getParserInstance();
      parser.body = {};
      parser.bodyRows = 'body';

      parser._parsePlainBody();

      let expected = {
        plain: 'body'
      };
      should(parser.body).eql(expected);
    });
  });

  describe('_getContentType', () => {
    function getDefaultHeaders() {
      return [
        {
          name: 'Connection',
          values: [
            { value: 'keep-alive' }
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
          name: 'Content-Type',
          values: [
            { value: 'application/json' }
          ]
        }
      ];
    }

    it('should return undefined when instance.headers does not include contentType header', () => {
      let parser = getParserInstance();
      parser.headers = getDefaultHeaders();
      parser.headers.splice(2, 1);

      let expected = undefined;
      let actual = parser._getContentType();

      should(actual).eql(expected);
    });

    it('should return contentType value', () => {
      let parser = getParserInstance();
      parser.headers = getDefaultHeaders();

      let expected = { value: 'application/json' };
      let actual = parser._getContentType();

      should(actual).eql(expected);
    });
  });
});
