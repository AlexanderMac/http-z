const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const pkg = require('./package.json')

module.exports = {
  input: 'index.js',
  output: {
    file: pkg.module,
    name: 'httpZ',
    format: 'umd',
    globals: {
      'lodash': '_'
    }
  },
  plugins: [
    nodeResolve(),
    commonjs()
  ],
  external: [
    'lodash'
  ]
}
