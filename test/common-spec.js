const _ = require('lodash')
const should = require('should')
const HttpZConsts = require('../src/consts')
const RequestBuilder = require('../src/builders/request')
const RequestParser = require('../src/parsers/request')

describe('parse-build-parse', ()=> {
  function getBuilderInstance(exRequestModel) {
    let requestModel = _.extend({
      method: 'get',
      protocol: 'http',
      protocolVersion: 'http/1.1',
      host: 'example.com',
      path: '/'
    }, exRequestModel)
    return new RequestBuilder(requestModel)
  }

  function getParserInstance(...params) {
    return new RequestParser(...params)
  }

  it('validate that build and parse are pure functions', () => {
    let requestModel = {
      method: 'POST',
      protocol: 'HTTP',
      protocolVersion: 'HTTP/1.1',
      host: 'example.com',
      path: '/features',
      queryParams: [
        { name: 'p1!@#$%^&*-=_+(){}', value: 'v1 !@#$%^&*()-=_+(){}[]' },
        { name: 'p2', value: 'v2' }
      ],
      headers: [
        {
          name: 'Content-Type',
          values: [
            { value: 'application/x-www-form-urlencoded', params: 'charset=UTF-8' }
          ]
        },
        {
          name: 'Auth-Token',
          values: [
            { value: 'vmbH^=%%mbJkq.lh-8!<}' }
          ]
        }
      ],
      body: {
        contentType: 'application/x-www-form-urlencoded',
        params: [
          { name: 'firstName', value: 'John' },
          { name: 'p1 !@#$%^&*()-=_+(){}', value: 'v1 !@#$%^&*()-=_+(){}[]' }
        ]
      },
      messageSize: 347,
      headersSize: 111,
      bodySize: 108
    }

    let plainRequest = [
      'POST /features?p1!%40%23%24%25%5E%26*-%3D_%2B()%7B%7D=v1%20!%40%23%24%25%5E%26*()-%3D_%2B()%7B%7D%5B%5D&p2=v2 HTTP/1.1',
      'Host: example.com',
      'Content-Type: application/x-www-form-urlencoded;charset=UTF-8',
      'Auth-Token: vmbH^=%%mbJkq.lh-8!<}',
      '',
      'firstName=John&p1%20!%40%23%24%25%5E%26*()-%3D_%2B()%7B%7D=v1%20!%40%23%24%25%5E%26*()-%3D_%2B()%7B%7D%5B%5D'
    ].join(HttpZConsts.EOL)

    let builder = getBuilderInstance(requestModel)
    should(builder.build()).eql(plainRequest)

    let parser = getParserInstance(plainRequest, HttpZConsts.EOL)
    should(parser.parse()).eql(requestModel)
  })
})
