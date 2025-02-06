const typescript = require('@rollup/plugin-typescript')
const dts = require('rollup-plugin-dts')

module.exports = [
  {
    input: 'src/index.ts',
    output: {
      dir: "dist",
      name: 'httpZ',
      format: 'umd',
      globals: {
        'lodash': '_',
      },
    },
    plugins: [
      typescript(),
    ],
    external: [
      'lodash',
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      dir: "dist",
    },
    plugins: [
      dts.dts(),
    ],
  }
]
