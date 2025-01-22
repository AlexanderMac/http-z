import * as httpZ from 'http-z'

export type Sample = {
  name: string
  message: string
  isSeparator?: boolean
}
export const PlainSamples: Sample[] = [
  {
    name: 'Request without headers and body',
    message: ['GET /features?p1=v1%3B&p2= HTTP/1.1', 'host: www.example.com', '', ''].join(httpZ.consts.EOL),
  },
  {
    name: 'Request without body',
    message: [
      'GET https://foo.com/bar HTTP/1.1',
      'host: example.com',
      'connection: ',
      'accept: */*',
      'accept-Encoding: gzip,deflate',
      'accept-language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0',
      'generated-by: "modern-framework 2020"',
      'Sec-ch-ua: "Google Chrome";v="87", " Not;A Brand";v="99", "Chromium";v="87"',
      'Authorization: AWS4-HMAC-SHA256 Credential=CRED/20210118/eu-west-1/s3/aws4_request, \
SignedHeaders=host;x-amz-acl;x-amz-user-agent, Signature=fb1e6017a1d',
      '',
      '',
    ].join(httpZ.consts.EOL),
  },
  {
    name: 'Request with cookies and without body',
    message: [
      'GET /features HTTP/1.1',
      'Host: example.com:8080',
      'Connection: ',
      'Accept: */*',
      'Accept-Encoding: gzip,deflate',
      'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'Cookie: csrftoken=123abc;sessionid=sd=456def%3B;userid=',
      '',
      '',
    ].join(httpZ.consts.EOL),
  },
  {
    name: 'Request with body of contentType=text/plain',
    message: [
      'POST /features HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Accept: */*',
      'Accept-Encoding: gzip,deflate',
      'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Encoding: gzip,deflate',
      'Content-Length: 301',
      '',
      'Text data',
    ].join(httpZ.consts.EOL),
  },
  {
    name: 'Request with body of contentType=application/x-www-form-urlencoded',
    message: [
      'POST /features HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Accept: */*',
      'Accept-Encoding: gzip,deflate',
      'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'Content-Type: application/x-www-form-urlencoded; charset=UTF-8',
      'Content-Encoding: gzip,deflate',
      'Content-Length: 301',
      '',
      'firstName=John&lastName=&age=25%3B',
    ].join(httpZ.consts.EOL),
  },
  {
    name: 'Request with body of contentType=multipart/form-data',
    message: [
      'POST /features HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Accept: */*',
      'Accept-Encoding: gzip,deflate',
      'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'Content-Type: multipart/form-data; boundary="111362:53119209"',
      'Content-Encoding: gzip,deflate',
      'Content-Length: 301',
      '',
      '--111362:53119209',
      'Content-Disposition: form-data; name="user.data[firstName]"',
      '',
      'John',
      '--111362:53119209',
      'Content-Disposition: form-data; name="photo"; filename="photo1.jpg"',
      'Content-Type: application/octet-stream',
      '',
      '<binary-data>',
      '--111362:53119209',
      'Content-Disposition: form-data; name="bio"',
      'Content-Type: text/plain',
      '',
      'some info',
      'more info',
      '',
      '--111362:53119209--',
    ].join(httpZ.consts.EOL),
  },
  {
    name: 'Request with body of contentType=multipart/alternative (inline)',
    message: [
      'POST /features HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Accept: */*',
      'Accept-Encoding: gzip,deflate',
      'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'Content-Type: multipart/alternative; boundary="111362-53119209"',
      'Content-Encoding: gzip,deflate',
      'Content-Length: 301',
      '',
      '--111362-53119209',
      'Content-Disposition: inline',
      '',
      '<base64-data>',
      '--111362-53119209--',
    ].join(httpZ.consts.EOL),
  },
  {
    name: 'Request with body of contentType=multipart/mixed (attachment)',
    message: [
      'POST /features HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Accept: */*',
      'Accept-Encoding: gzip,deflate',
      'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4',
      'Content-Type: multipart/mixed; boundary="11136253119209"',
      'Content-Encoding: gzip,deflate',
      'Content-Length: 301',
      '',
      '--11136253119209',
      'Content-Disposition: attachment; filename="photo1.jpg"',
      'Content-Type: application/octet-stream',
      '',
      '<binary-data>',
      '--11136253119209--',
    ].join(httpZ.consts.EOL),
  },
  {
    name: 'Request with transferEncoding=chunked',
    message: [
      'POST /features HTTP/1.1',
      'Host: example.com',
      'Connection: keep-alive',
      'Accept: */*',
      'Accept-Encoding: gzip, deflate',
      'Accept-Language: ru-RU, ru;q=0.8, en-US;q=0.6, en;q=0.4',
      'Content-Type: text/plain;charset=UTF-8',
      'Content-Encoding: gzip, deflate',
      'Transfer-Encoding: chunked',
      '',
      '19',
      'The Transfer-Encoding hea',
      '19',
      'der specifies the form of',
      '19',
      ' encoding used to safely ',
      '19',
      'transfer the payload body',
      'C',
      ' to the user',
    ].join(httpZ.consts.EOL),
  },
  {
    name: '──────────',
    message: '',
    isSeparator: true,
  },
  {
    name: 'Response without headers and body',
    message: ['HTTP/1.1 204 No content', '', ''].join(httpZ.consts.EOL),
  },
  {
    name: 'Response without body (header names in lower case)',
    message: [
      'HTTP/1.1 201 Created',
      'connection: ',
      'cache-Control: no-cache',
      'Content-type: text/plain; charset=UTF-8',
      'content-encoding: gzip,deflate',
      '',
      '',
    ].join(httpZ.consts.EOL),
  },
  {
    name: 'Response without cookies and body',
    message: [
      'HTTP/1.1 201 Created',
      'Connection: ',
      'Cache-Control: no-cache',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Encoding: gzip,deflate',
      'Set-Cookie: csrftoken=123abc',
      'Set-Cookie: sessionid=456def; Domain=example.com; Path=/',
      'Set-Cookie: username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly',
      '',
      '',
    ].join(httpZ.consts.EOL),
  },
  {
    name: 'Response with body of contentType=text/plain',
    message: [
      'HTTP/1.1 200 Ok',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Encoding: gzip,deflate',
      'Content-Length: 301',
      '',
      'Text data',
    ].join(httpZ.consts.EOL),
  },
  {
    name: 'Response with transferEncoding=chunked',
    message: [
      'HTTP/1.1 200 Ok',
      'Connection: keep-alive',
      'Cache-Control: no-cache',
      'Content-Encoding: gzip, deflate',
      'Content-Type: text/plain;charset=UTF-8',
      'Transfer-Encoding: chunked',
      '',
      '19',
      'The Transfer-Encoding hea',
      '19',
      'der specifies the form of',
      '19',
      ' encoding used to safely ',
      '19',
      'transfer the payload body',
      'C',
      ' to the user',
    ].join(httpZ.consts.EOL),
  },
]

export const ModelSamples: Sample[] = [
  {
    name: 'Request without headers and body',
    message: `{
  "method": "GET",
  "protocolVersion": "HTTP/1.1",
  "target": "/features?p1=v1%3B&p2=",
  "host": "www.example.com",
  "path": "/features",
  "headersSize": 62,
  "bodySize": 0,
  "queryParams": [
    {
      "name": "p1",
      "value": "v1;"
    },
    {
      "name": "p2",
      "value": ""
    }
  ],
  "headers": [
    {
      "name": "Host",
      "value": "www.example.com"
    }
  ]
}`,
  },
  {
    name: 'Request without body',
    message: `{
  "method": "GET",
  "protocolVersion": "HTTP/1.1",
  "target": "https://foo.com/bar",
  "host": "example.com",
  "path": "/bar",
  "headersSize": 529,
  "bodySize": 0,
  "queryParams": [],
  "headers": [
    {
      "name": "Host",
      "value": "example.com"
    },
    {
      "name": "Connection",
      "value": ""
    },
    {
      "name": "Accept",
      "value": "*/*"
    },
    {
      "name": "Accept-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Accept-Language",
      "value": "ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4"
    },
    {
      "name": "User-Agent",
      "value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:67.0) Gecko/20100101 Firefox/67.0"
    },
    {
      "name": "Generated-By",
      "value": "modern-framework 2020"
    },
    {
      "name": "Sec-Ch-Ua",
      "value": "\\"Google Chrome\\";v=\\"87\\", \\" Not;A Brand\\";v=\\"99\\", \\"Chromium\\";v=\\"87\\""
    },
    {
      "name": "Authorization",
      "value": "AWS4-HMAC-SHA256 Credential=CRED/20210118/eu-west-1/s3/aws4_request, SignedHeaders=host;x-amz-acl;x-amz-user-agent, Signature=fb1e6017a1d"
    }
  ]
}`,
  },
  {
    name: 'Request with cookies and without body',
    message: `{
  "method": "GET",
  "protocolVersion": "HTTP/1.1",
  "target": "/features",
  "host": "example.com:8080",
  "path": "/features",
  "headersSize": 219,
  "bodySize": 0,
  "queryParams": [],
  "headers": [
    {
      "name": "Host",
      "value": "example.com:8080"
    },
    {
      "name": "Connection",
      "value": ""
    },
    {
      "name": "Accept",
      "value": "*/*"
    },
    {
      "name": "Accept-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Accept-Language",
      "value": "ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4"
    },
    {
      "name": "Cookie",
      "value": "csrftoken=123abc;sessionid=sd=456def%3B;userid="
    }
  ],
  "cookies": [
    {
      "name": "csrftoken",
      "value": "123abc"
    },
    {
      "name": "sessionid",
      "value": "sd=456def%3B"
    },
    {
      "name": "userid"
    }
  ]
}`,
  },
  {
    name: 'Request with body of contentType=text/plain',
    message: `{
  "method": "POST",
  "protocolVersion": "HTTP/1.1",
  "target": "/features",
  "host": "example.com",
  "path": "/features",
  "headersSize": 262,
  "bodySize": 9,
  "queryParams": [],
  "headers": [
    {
      "name": "Host",
      "value": "example.com"
    },
    {
      "name": "Connection",
      "value": "keep-alive"
    },
    {
      "name": "Accept",
      "value": "*/*"
    },
    {
      "name": "Accept-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Accept-Language",
      "value": "ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4"
    },
    {
      "name": "Content-Type",
      "value": "text/plain; charset=UTF-8"
    },
    {
      "name": "Content-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Content-Length",
      "value": "301"
    }
  ],
  "body": {
    "contentType": "text/plain",
    "text": "Text data"
  }
}`,
  },
  {
    name: 'Request with body of contentType=application/x-www-form-urlencoded',
    message: `{
  "method": "POST",
  "protocolVersion": "HTTP/1.1",
  "target": "/features",
  "host": "example.com",
  "path": "/features",
  "headersSize": 285,
  "bodySize": 34,
  "queryParams": [],
  "headers": [
    {
      "name": "Host",
      "value": "example.com"
    },
    {
      "name": "Connection",
      "value": "keep-alive"
    },
    {
      "name": "Accept",
      "value": "*/*"
    },
    {
      "name": "Accept-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Accept-Language",
      "value": "ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4"
    },
    {
      "name": "Content-Type",
      "value": "application/x-www-form-urlencoded; charset=UTF-8"
    },
    {
      "name": "Content-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Content-Length",
      "value": "301"
    }
  ],
  "body": {
    "contentType": "application/x-www-form-urlencoded",
    "params": [
      {
        "name": "firstName",
        "value": "John"
      },
      {
        "name": "lastName",
        "value": ""
      },
      {
        "name": "age",
        "value": "25;"
      }
    ]
  }
}`,
  },
  {
    name: 'Request with body of contentType=multipart/form-data',
    message: `{
  "method": "POST",
  "protocolVersion": "HTTP/1.1",
  "target": "/features",
  "host": "example.com",
  "path": "/features",
  "headersSize": 284,
  "bodySize": 367,
  "queryParams": [],
  "headers": [
    {
      "name": "Host",
      "value": "example.com"
    },
    {
      "name": "Connection",
      "value": "keep-alive"
    },
    {
      "name": "Accept",
      "value": "*/*"
    },
    {
      "name": "Accept-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Accept-Language",
      "value": "ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4"
    },
    {
      "name": "Content-Type",
      "value": "multipart/form-data; boundary=\\"111362:53119209\\""
    },
    {
      "name": "Content-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Content-Length",
      "value": "301"
    }
  ],
  "body": {
    "contentType": "multipart/form-data",
    "boundary": "111362:53119209",
    "params": [
      {
        "value": "John",
        "name": "user.data[firstName]"
      },
      {
        "value": "<binary-data>",
        "contentType": "application/octet-stream",
        "name": "photo",
        "fileName": "photo1.jpg"
      },
      {
        "value": "some info\\r\\nmore info\\r\\n",
        "contentType": "text/plain",
        "name": "bio"
      }
    ]
  }
}`,
  },
  {
    name: 'Request with body of contentType=multipart/alternative (inline)',
    message: `{
  "method": "POST",
  "protocolVersion": "HTTP/1.1",
  "target": "/features",
  "host": "example.com",
  "path": "/features",
  "headersSize": 286,
  "bodySize": 84,
  "queryParams": [],
  "headers": [
    {
      "name": "Host",
      "value": "example.com"
    },
    {
      "name": "Connection",
      "value": "keep-alive"
    },
    {
      "name": "Accept",
      "value": "*/*"
    },
    {
      "name": "Accept-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Accept-Language",
      "value": "ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4"
    },
    {
      "name": "Content-Type",
      "value": "multipart/alternative; boundary=\\"111362-53119209\\""
    },
    {
      "name": "Content-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Content-Length",
      "value": "301"
    }
  ],
  "body": {
    "contentType": "multipart/alternative",
    "boundary": "111362-53119209",
    "params": [
      {
        "value": "<base64-data>",
        "type": "inline"
      }
    ]
  }
}`,
  },
  {
    name: 'Request with body of contentType=multipart/mixed (attachment)',
    message: `{
  "method": "POST",
  "protocolVersion": "HTTP/1.1",
  "target": "/features",
  "host": "example.com",
  "path": "/features",
  "headersSize": 279,
  "bodySize": 149,
  "queryParams": [],
  "headers": [
    {
      "name": "Host",
      "value": "example.com"
    },
    {
      "name": "Connection",
      "value": "keep-alive"
    },
    {
      "name": "Accept",
      "value": "*/*"
    },
    {
      "name": "Accept-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Accept-Language",
      "value": "ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4"
    },
    {
      "name": "Content-Type",
      "value": "multipart/mixed; boundary=\\"11136253119209\\""
    },
    {
      "name": "Content-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Content-Length",
      "value": "301"
    }
  ],
  "body": {
    "contentType": "multipart/mixed",
    "boundary": "11136253119209",
    "params": [
      {
        "value": "<binary-data>",
        "type": "attachment",
        "contentType": "application/octet-stream",
        "fileName": "photo1.jpg"
      }
    ]
  }
}`,
  },
  {
    name: 'Request with transferEncoding=chunked',
    message: `{
  "method": "POST",
  "protocolVersion": "HTTP/1.1",
  "target": "/features",
  "host": "example.com",
  "path": "/features",
  "headersSize": 269,
  "bodySize": 140,
  "queryParams": [],
  "headers": [
    {
      "name": "Host",
      "value": "example.com"
    },
    {
      "name": "Connection",
      "value": "keep-alive"
    },
    {
      "name": "Accept",
      "value": "*/*"
    },
    {
      "name": "Accept-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Accept-Language",
      "value": "ru-RU,ru;q=0.8,en-US;q=0.6,en;q=0.4"
    },
    {
      "name": "Content-Type",
      "value": "text/plain; charset=UTF-8"
    },
    {
      "name": "Content-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Transfer-Encoding",
      "value": "chunked"
    }
  ],
  "body": {
    "contentType": "text/plain",
    "text": "The Transfer-Encoding header specifies the form of encoding used to safely transfer the payload body to the user"
  }
}`,
  },
  {
    name: '──────────',
    message: '',
    isSeparator: true,
  },
  {
    name: 'Response without headers and body',
    message: `{
  "protocolVersion": "HTTP/1.1",
  "statusCode": 204,
  "statusMessage": "No content",
  "headersSize": 27,
  "bodySize": 0,
  "headers": []
}`,
  },
  {
    name: 'Response without body (header names in lower case)',
    message: `{
  "protocolVersion": "HTTP/1.1",
  "statusCode": 201,
  "statusMessage": "Created",
  "headersSize": 136,
  "bodySize": 0,
  "headers": [
    {
      "name": "Connection",
      "value": ""
    },
    {
      "name": "Cache-Control",
      "value": "no-cache"
    },
    {
      "name": "Content-Type",
      "value": "text/plain; charset=UTF-8"
    },
    {
      "name": "Content-Encoding",
      "value": "gzip,deflate"
    }
  ]
}`,
  },
  {
    name: 'Response without cookies and body',
    message: `{
  "protocolVersion": "HTTP/1.1",
  "statusCode": 201,
  "statusMessage": "Created",
  "headersSize": 309,
  "bodySize": 0,
  "headers": [
    {
      "name": "Connection",
      "value": ""
    },
    {
      "name": "Cache-Control",
      "value": "no-cache"
    },
    {
      "name": "Content-Type",
      "value": "text/plain; charset=UTF-8"
    },
    {
      "name": "Content-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Set-Cookie",
      "value": "csrftoken=123abc"
    },
    {
      "name": "Set-Cookie",
      "value": "sessionid=456def; Domain=example.com; Path=/"
    },
    {
      "name": "Set-Cookie",
      "value": "username=smith; Expires=Wed, 21 Oct 2015 07:28:00 GMT; Secure; HttpOnly"
    }
  ],
  "cookies": [
    {
      "name": "csrftoken",
      "value": "123abc"
    },
    {
      "name": "sessionid",
      "value": "456def",
      "params": [
        "Domain=example.com",
        "Path=/"
      ]
    },
    {
      "name": "username",
      "value": "smith",
      "params": [
        "Expires=Wed, 21 Oct 2015 07:28:00 GMT",
        "Secure",
        "HttpOnly"
      ]
    }
  ]
}`,
  },
  {
    name: 'Response with body of contentType=text/plain',
    message: `{
  "protocolVersion": "HTTP/1.1",
  "statusCode": 200,
  "statusMessage": "Ok",
  "headersSize": 162,
  "bodySize": 9,
  "headers": [
    {
      "name": "Connection",
      "value": "keep-alive"
    },
    {
      "name": "Cache-Control",
      "value": "no-cache"
    },
    {
      "name": "Content-Type",
      "value": "text/plain; charset=UTF-8"
    },
    {
      "name": "Content-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Content-Length",
      "value": "301"
    }
  ],
  "body": {
    "contentType": "text/plain",
    "text": "Text data"
  }
}`,
  },
  {
    name: 'Response with transferEncoding=chunked',
    message: `{
  "protocolVersion": "HTTP/1.1",
  "statusCode": 200,
  "statusMessage": "Ok",
  "headersSize": 169,
  "bodySize": 140,
  "headers": [
    {
      "name": "Connection",
      "value": "keep-alive"
    },
    {
      "name": "Cache-Control",
      "value": "no-cache"
    },
    {
      "name": "Content-Type",
      "value": "text/plain; charset=UTF-8"
    },
    {
      "name": "Content-Encoding",
      "value": "gzip,deflate"
    },
    {
      "name": "Transfer-Encoding",
      "value": "chunked"
    }
  ],
  "body": {
    "contentType": "text/plain",
    "text": "The Transfer-Encoding header specifies the form of encoding used to safely transfer the payload body to the user"
  }
}`,
  },
]
