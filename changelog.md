# <sub>v0.7.0</sub>
#### _Jul_. 14, 2019_

  * Convert queryParams to array of the format [{ name, value }].
  * Add special processing for user-agent header.

# <sub>v0.6.3</sub>
#### _Jun_. 25, 2019_

  * Add consts to export.
  * Bug fixes.

# <sub>v0.6.0</sub>
#### _Jun_. 18, 2019_

  * Rename field `params` to `queryParams`.

# <sub>v0.5.0</sub>
#### _May_. 20, 2019_

 * Change `parse` method declaration, now it accepts the arguments list instead of params object: `parse('message', 'eol)`.

# <sub>v0.4.3</sub>
#### _Apr_. 17, 2019_

 * Fix request startRow processing with empty path (in parser).
 * Fix body processing with unsupported content-type (in builder).
 * Update packages to the latest versions.

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

 * The first release.
