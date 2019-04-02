'use strict';

const sinon           = require('sinon');
const should          = require('should');
const nassert         = require('n-assert');
const builder         = require('../../src/builders');
const RequestBuilder  = require('../../src/builders/request');
const ResponseBuilder = require('../../src/builders/response');

describe('builders / index', () => {
  beforeEach(() => {
    sinon.stub(RequestBuilder, 'build');
    sinon.stub(ResponseBuilder, 'build');
  });

  afterEach(() => {
    RequestBuilder.build.restore();
    ResponseBuilder.build.restore();
  });

  it('should throw error when httpModel is undefined', () => {
    should(builder.bind(null)).throw(Error, {
      message: 'httpModel is required'
    });
  });

  it('should throw error when model has unknown format', () => {
    let httpModel = {
      data: 'some data'
    };

    should(builder.bind(null, httpModel)).throw(Error, {
      message: 'Unknown httpModel format'
    });
  });

  it('should call RequestBuilder.build when httpModel is request', () => {
    let httpModel = {
      method: 'GET'
    };
    let expected = 'built-request';
    let expectedArgs = httpModel;

    RequestBuilder.build.returns('built-request');

    let actual = builder(httpModel);
    should(actual).eql(expected);

    nassert.validateCalledFn({ srvc: RequestBuilder, fnName: 'build', expectedArgs });
  });

  it('should call ResponseBuilder.build when httpModel is response', () => {
    let httpModel = {
      statusCode: 200
    };
    let expected = 'built-response';
    let expectedArgs = httpModel;

    ResponseBuilder.build.returns('built-response');

    let actual = builder(httpModel);
    should(actual).eql(expected);

    nassert.validateCalledFn({ srvc: ResponseBuilder, fnName: 'build', expectedArgs });
  });
});
