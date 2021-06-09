## v6.1.0
#### _Jun. 9, 2021_
  * Add options to request parser/builder, if `mandatoryHost` is true, host header is validated.

## v6.0.0
#### _May. 30, 2021_
  * **BREAKING:** Request builder accepts `target` instead of `path` and `queryParameters` parameters.
  * **BREAKING:** Request/Response builders don't accept `cookies` parameter anymore (cookies must be present in `headers` array as the regular headers).
  * **BREAKING:** Request/Response parsers don't remove `Cookie`/`Set-Cookie` headers from `headers` array anymore.

## v5.1.1
#### _May. 24, 2021_
  * Don't validate host header.

## v5.1.0
#### _May. 24, 2021_
  * Export the new `target` field (request target) in request parser.
  * Don't omit `Host` header in request parser, export it as a regular header.
  * Don't use `Host` field to generate request message in builder, use `Host` header from `headers` array instead.

## v5.0.0
#### _May. 21, 2021_
  * **BREAKING:** Drop support for Node v10.

## v4.0.4
#### _Feb. 26, 2021_
  * Update dependencies.

## v4.0.3
#### _Jan. 28, 2021_
  * Url-decode url.host and url.path in parse action.

## v4.0.2
#### _Jan. 27, 2021_
  * Don't process empty arrays (with zero elements) in builder.

## v4.0.1
#### _Jan. 26, 2021_
  * Validate that header name is not empty in builder.

## v4.0.0
#### _Jan. 20, 2021_
  * **BREAKING**: Store header value as is (don't parse for values and params). Now header is an object with two string fields: `name` and `value`.

## v3.2.1
#### _Jan. 8, 2021_
  * Fix types defenitions.

## v3.2.0
#### _Dec. 3, 2020_
  * Integrate rollup and create client bundle (add browser support).

## v3.1.2
#### _Dec. 2, 2020_
  * Replace prefix `plain` to `raw`.

## v3.1.1
#### _Dec. 2, 2020_
  * Skip `set-cookie` headers in response builder, use `cookies` object from model.

## v3.1.0
#### _Oct. 27, 2020_
  * Remove `qs` module, use the native `URLSearchParams`.

## v3.0.1
#### _Oct. 19, 2020_
  * Fix typo: `pathch` => `patch`.

## v3.0.0
#### _Oct. 14, 2020_
  * Refactor codebase according to RFC 7230.
  * Add full support for multipart/* body (except encoding stuff).
  * Add optional parameters to message body model: `type`, `contentType`, `fileName`.
  * **BREAKING**: Use `\r\n` as line separator instead of `\n`.
  * **BREAKING**: Remove `messageSize` from message model.

## v2.2.1
#### _Aug. 17, 2020_
  * Add support for new HTTP methods.

## v2.2.0
#### _May. 12, 2020_
  * Encode/decode url path and www-url-encoded body in builder and parser.

## v2.1.2.
#### _May. 11, 2020_
  * Add ending `\n` in multipart/formdata body.

## v2.1.1.
#### _May. 2, 2020_
  * Fix cookies parser with value containing `=` (equals) symbol.

## v2.1.0.
#### _May. 1, 2020_
  * Filter out `host` and `cookie` headers in request builder. They must be provided via own fields in model.

## v2.0.2.
#### _Mar. 30, 2020_
  * Disallow `response.statusCode` equals zero.

## v2.0.1.
#### _Mar. 30, 2020_
  * Allow `response.statusCode` equals zero.

## v2.0.0.
#### _Feb. 6, 2020_
  * Add support for all known HTTP-methods .
  * **BREAKING**: Merge `body.json` and `body.plain` and rename it to `body.text`.

## v1.0.1.
#### _Feb. 5, 2020_
  * Fix util method for url parsing.

## v1.0.0.
#### _Feb. 3, 2020_
  * Add `messageSize`, `headersSize`, `bodySize` to request and response models.
  * Create type definitions file.
  * Stabilize api.
  * **BREAKING**: Rename `body.formDataParams` to `body.params`.

## v0.12.0.
#### _Jan. 15, 2020_
  * **BREAKING**: Drop support for Node v8.

## v0.11.1.
#### _Oct. 30, 2019_
  * Fix regexp for boundary.

## v0.11.0.
#### _Sep. 4, 2019_
  * Allow empty values for queryParams, headers.
  * Don't add field with null values for empty/missing values.

## v0.10.1.
#### _Aug. 19, 2019_
  * Remove ending asterisks from http.contentType.any constants.

## v0.10.0.
#### _Aug. 19, 2019_
  * Split HTTP contentType into groups.

## v0.9.2
#### _Aug. 15, 2019_
  * Add HTTP constants.

## v0.9.1
#### _Aug. 10, 2019_
  * Bug fixes.

## v0.9.0
#### _Aug. 10, 2019_
  * Determine `message.eol` in the parser automatically.

## v0.8.0
#### _Aug. 9, 2019_
  * **BREAKING**: Drop support for Node v6.
  * Throw `HttpZError`. Don't extend `err.message` by error details, provide it as `err.details` field instead.

## v0.7.0
#### _Jul. 14, 2019_
  * **BREAKING**: Convert queryParams to array of the format `[{ name, value }]`.
  * Add special processing for user-agent header.

## v0.6.3
#### _Jun. 25, 2019_
  * Bug fixes.

## v0.6.2
#### _Jun. 23, 2019_
  * Bug fixes.

## v0.6.1
#### _Jun. 23, 2019_
  * Add consts to export.

## v0.6.0
#### _Jun. 18, 2019_
  * **BREAKING**: Rename field `params` to `queryParams`.

## v0.5.0
#### _May. 20, 2019_
 * **BREAKING**: Change `parse` method declaration, now it accepts the arguments list instead of params object: `parse('message', 'eol)`.

## v0.4.3
#### _Apr. 17, 2019_
 * Fix request startRow processing with empty path (in parser).
 * Fix body processing with unsupported content-type (in builder).

## v0.4.2
#### _Apr. 6, 2019_
 * Update packages to the last versions.

## v0.4.1
#### _Apr. 4, 2019_
  * Bug fixes.

## v0.4.0
#### _Apr. 4, 2019_
 * Add logic for parsing/building multiple set-cookie headers in response parser/builder.
 * Fix logic for parsing/building path and host.
 * **BREAKING**: Remove HTTP Basic auth.

## v0.3.0
#### _Apr. 3, 2019_
 * Stabilize the builders api.

## v0.2.0
#### _Apr. 2, 2019_
 * Stabilize the parsers api.

## v0.1.0
#### _Feb. 7, 2019_
 * Release the first version.