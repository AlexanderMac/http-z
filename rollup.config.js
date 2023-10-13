const resolve = require('@rollup/plugin-node-resolve')
const commonjs = require('@rollup/plugin-commonjs')
const pkg = require('./package.json')

module.exports = [
  {
    input: 'index.js',
    output: {
      name: 'httpZ',
      file: pkg.browser,
      format: 'umd',
      globals: {
        'lodash': '_'
      }
    },
    plugins: [
      resolve(),
      commonjs()
    ],
    external: [
      'lodash'
    ]
  }
]
