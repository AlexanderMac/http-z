# <sub>v5.0.0</sub>
#### _May. 21, 2021_
  * Drop support for Node v10.

# <sub>v4.0.4</sub>
#### _Feb. 26, 2021_
  * Update dependencies.

# <sub>v4.0.3</sub>
#### _Jan. 28, 2021_
  * Url-decode url.host and url.path in parse action.

# <sub>v4.0.2</sub>
#### _Jan. 27, 2021_
  * Don't process empty arrays (with zero elements) in builder.

# <sub>v4.0.1</sub>
#### _Jan. 26, 2021_
  * Validate that header name is not empty in builder.

# <sub>v4.0.0</sub>
#### _Jan. 20, 2021_
  * Store header value as is (don't parse for values and params). Now header is an object with two string fields: `name` and `value`.

# <sub>v3.2.1</sub>
#### _Jan. 8, 2021_
  * Fix types defenitions.

# <sub>v3.2.0</sub>
#### _Dec. 3, 2020_
  * Integrate rollup and create client bundle (add browser support).

# <sub>v3.1.2</sub>
#### _Dec. 2, 2020_
  * Replace prefix `plain` to `raw`.

# <sub>v3.1.1</sub>
#### _Dec. 2, 2020_
  * Skip `set-cookie` headers in response builder, use `cookies` object from model.

# <sub>v3.1.0</sub>
#### _Oct. 27, 2020_
  * Remove `qs` module, use the native `URLSearchParams`.

# <sub>v3.0.1</sub>
#### _Oct. 19, 2020_
  * Fix typo: `pathch` => `patch`.

# <sub>v3.0.0</sub>
#### _Oct. 14, 2020_
  * Refactor codebase according to RFC 7230.
  * Add full support for multipart/* body (except encoding stuff).
  * Use `\r\n` as line separator instead of `\n`.
  * Add optional parameters to message body model: `type`, `contentType`, `fileName`.
  * Remove `messageSize` from message model.

# <sub>v2.2.1</sub>
#### _Aug. 17, 2020_
  * Add support for new HTTP methods.

# <sub>v2.2.0</sub>
#### _May. 12, 2020_
  * Encode/decode url path and www-url-encoded body in builder and parser.

# <sub>v2.1.2.</sub>
#### _May. 11, 2020_
  * Add ending \n in multipart/formdata body.

# <sub>v2.1.1.</sub>
#### _May. 2, 2020_
  * Fix cookies parser with value containing `=` (equals) symbol.

# <sub>v2.1.0.</sub>
#### _May. 1, 2020_
  * Filter out `host` and `cookie` headers in request builder. They must be provided via own fields in model.

# <sub>v2.0.2.</sub>
#### _Mar. 30, 2020_
  * Disallow `response.statusCode` equals zero.

# <sub>v2.0.1.</sub>
#### _Mar. 30, 2020_
  * Allow `response.statusCode` equals zero.

# <sub>v2.0.0.</sub>
#### _Feb. 6, 2020_
  * Add support for all known HTTP-methods .
  * Merge `body.json` and `body.plain` and rename it to `body.text`.

# <sub>v1.0.1.</sub>
#### _Feb. 5, 2020_
  * Fix util method for url parsing.

# <sub>v1.0.0.</sub>
#### _Feb. 3, 2020_
  * Add `messageSize`, `headersSize`, `bodySize` to request and response models.
  * Rename `body.formDataParams` to `body.params`.
  * Create type definitions file.
  * Stabilize api.

# <sub>v0.12.0.</sub>
#### _Jan. 15, 2020_
  * Drop support for Node v8.

# <sub>v0.11.1.</sub>
#### _Oct. 30, 2019_
  * Fix regexp for boundary.

# <sub>v0.11.0.</sub>
#### _Sep. 4, 2019_
  * Allow empty values for queryParams, headers.
  * Don't add field with null values for empty/missing values.

# <sub>v0.10.1.</sub>
#### _Aug. 19, 2019_
  * Remove ending asterisks from http.contentType.any constants.

# <sub>v0.10.0.</sub>
#### _Aug. 19, 2019_
  * Split HTTP contentType into groups.

# <sub>v0.9.2</sub>
#### _Aug. 15, 2019_
  * Add HTTP constants.

# <sub>v0.9.1</sub>
#### _Aug. 10, 2019_
  * Bug fixes.

# <sub>v0.9.0</sub>
#### _Aug. 10, 2019_
  * Determine `message.eol` in the parser automatically.

# <sub>v0.8.0</sub>
#### _Aug. 9, 2019_
  * Drop support for Node v6.
  * Throw `HttpZError` in all the cases. Don't extend `err.message` by error details, provide it as `err.details` field instead.

# <sub>v0.7.0</sub>
#### _Jul. 14, 2019_
  * Convert queryParams to array of the format `[{ name, value }]`.
  * Add special processing for user-agent header.

# <sub>v0.6.3</sub>
#### _Jun. 25, 2019_
  * Bug fixes.

# <sub>v0.6.2</sub>
#### _Jun. 23, 2019_
  * Bug fixes.

# <sub>v0.6.1</sub>
#### _Jun. 23, 2019_
  * Add consts to export.

# <sub>v0.6.0</sub>
#### _Jun. 18, 2019_
  * Rename field `params` to `queryParams`.

# <sub>v0.5.0</sub>
#### _May. 20, 2019_
 * Change `parse` method declaration, currently it accepts the arguments list instead of params object: `parse('message', 'eol)`.

# <sub>v0.4.3</sub>
#### _Apr. 17, 2019_
 * Fix request startRow processing with empty path (in parser).
 * Fix body processing with unsupported content-type (in builder).

# <sub>v0.4.2</sub>
#### _Apr. 6, 2019_
 * Update packages to the last versions.

# <sub>v0.4.1</sub>
#### _Apr. 4, 2019_
  * Bug fixes.

# <sub>v0.4.0</sub>
#### _Apr. 4, 2019_
 * Add logic for parsing/building multiple set-cookie headers in response parser/builder.
 * Fix logic for parsing/building path and host.
 * Remove HTTP Basic auth.

# <sub>v0.3.0</sub>
#### _Apr. 3, 2019_
 * Stabilize the builders api.
 * Cover by tests the builders codebase.

# <sub>v0.2.0</sub>
#### _Apr. 2, 2019_
 * Stabilize the parsers api.
 * Cover by tests the parsers codebase.

# <sub>v0.1.0</sub>
#### _Feb. 7, 2019_
 * Release the first version.