module.exports = {
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: [
          'raw-loader',
          'pug-html-loader'
        ],
        exclude: /(node_modules)/
      }
    ]
  }
}
