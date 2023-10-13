parserExamples = [
  {
    name: 'Request without headers and body',
    message: [
      'GET /features?p1=v1%3B&p2= HTTP/1.1',
      'host: www.example.com',
      '',
      ''
    ].join(httpZ.consts.EOL)
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
      ''
    ].join(httpZ.consts.EOL)
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
      ''
    ].join(httpZ.consts.EOL)
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
      'Text data'
    ].join(httpZ.consts.EOL)
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
      'firstName=John&lastName=&age=25%3B'
    ].join(httpZ.consts.EOL)
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
      '--111362:53119209--'
    ].join(httpZ.consts.EOL)
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
      '--111362-53119209--'
    ].join(httpZ.consts.EOL)
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
      '--11136253119209--'
    ].join(httpZ.consts.EOL)
  },
  {
    name: 'separator'
  },
  {
    name: 'Response without headers and body',
    message: [
      'HTTP/1.1 204 No content',
      '',
      ''
    ].join(httpZ.consts.EOL)
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
      ''
    ].join(httpZ.consts.EOL)
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
      ''
    ].join(httpZ.consts.EOL)
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
      'Text data'
    ].join(httpZ.consts.EOL)
  }
]
