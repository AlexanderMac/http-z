# Changelog

## v8.1.1 (May. 6, 2025)
- Fix typings.

## v8.1.0 (Mar. 24, 2025)
- Add support for `HTTP/3` messages.
- Fix `regexps.contentDisposition` to support all unicode characters.

## v8.0.0 (Feb. 13, 2025)
- **BREAKING:** Drop support for Node versions prior v18.
- Convert codebase to TypeScript. Replace Mocha + Should to Jest.
- Delete Lodash dependency. Now http-z has zero dependencies!

## v7.1.3 (Jan. 22, 2025)
- Fix building messages for `Transfer-Encoding: chunked`.

## v7.1.2 (Jan. 22, 2025)
- Fix parsing messages for `Transfer-Encoding: chunked`, https://github.com/AlexanderMac/http-z/pull/67.

## v7.1.1 (Mar. 27, 2024)
- Fix type definitions.

## v7.1.0 (Mar. 25, 2024)
- Add support for `Transfer-Encoding: chunked`.
- Fix bugs in type definitions.

## v7.0.0 (Oct. 12, 2023)
- **BREAKING:** Drop support for Node versions prior v16.
- Create online demo.
- Fix bugs in type definitions.

## v6.1.2 (Jun. 10, 2021)
- Fix bug in form params parser.

## v6.1.1 (Jun. 9, 2021)
- Allow empty Set-Cookie header.

## v6.1.0 (Jun. 9, 2021)
- Add options to request parser/builder, if `mandatoryHost` is true, host header is validated.

## v6.0.0 (May. 30, 2021)
- **BREAKING:** Request builder accepts `target` instead of `path` and `queryParameters` parameters.
- **BREAKING:** Request/Response builders don't accept `cookies` parameter anymore (cookies must be present in `headers` array as the regular headers).
- **BREAKING:** Request/Response parsers don't remove `Cookie`/`Set-Cookie` headers from `headers` array anymore.

## v5.1.1 (May. 24, 2021)
- Don't validate host header.

## v5.1.0 (May. 24, 2021)
- Export the new `target` field (request target) in request parser.
- Don't omit `Host` header in request parser, export it as a regular header.
- Don't use `Host` field to generate request message in builder, use `Host` header from `headers` array instead.

## v5.0.0 (May. 21, 2021)
- **BREAKING:** Drop support for Node versions prior v12.

## v4.0.4 (Feb. 26, 2021)
- Update dependencies.

## v4.0.3 (Jan. 28, 2021)
- Url-decode url.host and url.path in parse action.

## v4.0.2 (Jan. 27, 2021)
- Don't process empty arrays (with zero elements) in builder.

## v4.0.1 (Jan. 26, 2021)
- Validate that header name is not empty in builder.

## v4.0.0 (Jan. 20, 2021)
- **BREAKING**: Store header value as is (don't parse for values and params). Now header is an object with two string fields: `name` and `value`.

## v3.2.1 (Jan. 8, 2021)
- Fix types defenitions.

## v3.2.0 (Dec. 3, 2020)
- Integrate rollup and create client bundle (add browser support).

## v3.1.2 (Dec. 2, 2020)
- Replace prefix `plain` to `raw`.

## v3.1.1 (Dec. 2, 2020)
- Skip `set-cookie` headers in response builder, use `cookies` object from model.

## v3.1.0 (Oct. 27, 2020)
- Remove `qs` module, use the native `URLSearchParams`.

## v3.0.1 (Oct. 19, 2020)
- Fix typo: `pathch` => `patch`.

## v3.0.0 (Oct. 14, 2020)
- Refactor codebase according to RFC 7230.
- Add full support for multipart/* body (except encoding stuff).
- Add optional parameters to message body model: `type`, `contentType`, `fileName`.
- **BREAKING**: Use `\r\n` as line separator instead of `\n`.
- **BREAKING**: Remove `messageSize` from message model.

## v2.2.1 (Aug. 17, 2020)
- Add support for new HTTP methods.

## v2.2.0 (May. 12, 2020)
- Encode/decode url path and www-url-encoded body in builder and parser.

## v2.1.2. (May. 11, 2020)
- Add ending `\n` in multipart/formdata body.

## v2.1.1. (May. 2, 2020)
- Fix cookies parser with value containing `=` (equals) symbol.

## v2.1.0. (May. 1, 2020)
- Filter out `host` and `cookie` headers in request builder. They must be provided via own fields in model.

## v2.0.2. (Mar. 30, 2020)
- Disallow `response.statusCode` equals zero.

## v2.0.1. (Mar. 30, 2020)
- Allow `response.statusCode` equals zero.

## v2.0.0. (Feb. 6, 2020)
- Add support for all known HTTP-methods .
- **BREAKING**: Merge `body.json` and `body.plain` and rename it to `body.text`.

## v1.0.1. (Feb. 5, 2020)
- Fix util method for url parsing.

## v1.0.0. (Feb. 3, 2020)
- Add `messageSize`, `headersSize`, `bodySize` to request and response models.
- Create type definitions file.
- Stabilize api.
- **BREAKING**: Rename `body.formDataParams` to `body.params`.

## v0.12.0. (Jan. 15, 2020)
- **BREAKING**: Drop support for Node v8 and less.

## v0.11.1. (Oct. 30, 2019)
- Fix regexp for boundary.

## v0.11.0. (Sep. 4, 2019)
- Allow empty values for queryParams, headers.
- Don't add field with null values for empty/missing values.

## v0.10.1. (Aug. 19, 2019)
- Remove ending asterisks from http.contentType.any constants.

## v0.10.0. (Aug. 19, 2019)
- Split HTTP contentType into groups.

## v0.9.2 (Aug. 15, 2019)
- Add HTTP constants.

## v0.9.1 (Aug. 10, 2019)
- Bug fixes.

## v0.9.0 (Aug. 10, 2019)
- Determine `message.eol` in the parser automatically.

## v0.8.0 (Aug. 9, 2019)
- **BREAKING**: Drop support for Node v6 and less.
- Throw `HttpZError`. Don't extend `err.message` by error details, provide it as `err.details` field instead.

## v0.7.0 (Jul. 14, 2019)
- **BREAKING**: Convert queryParams to array of the format `[{ name, value }]`.
- Add special processing for user-agent header.

## v0.6.3 (Jun. 25, 2019)
- Bug fixes.

## v0.6.2 (Jun. 23, 2019)
- Bug fixes.

## v0.6.1 (Jun. 23, 2019)
- Add consts to export.

## v0.6.0 (Jun. 18, 2019)
- **BREAKING**: Rename field `params` to `queryParams`.

## v0.5.0 (May. 20, 2019)
 * **BREAKING**: Change `parse` method declaration, now it accepts the arguments list instead of params object: `parse('message', 'eol)`.

## v0.4.3 (Apr. 17, 2019)
 * Fix request startRow processing with empty path (in parser).
 * Fix body processing with unsupported content-type (in builder).

## v0.4.2 (Apr. 6, 2019)
 * Update packages to the last versions.

## v0.4.1 (Apr. 4, 2019)
- Bug fixes.

## v0.4.0 (Apr. 4, 2019)
 * Add logic for parsing/building multiple set-cookie headers in response parser/builder.
 * Fix logic for parsing/building path and host.
 * **BREAKING**: Remove HTTP Basic auth.

## v0.3.0 (Apr. 3, 2019)
 * Stabilize the builders api.

## v0.2.0 (Apr. 2, 2019)
 * Stabilize the parsers api.

## v0.1.0 (Feb. 7, 2019)
 * Release the first version.
