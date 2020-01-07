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