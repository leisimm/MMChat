const path = require('path')
const webpack = require('webpack')

const mainConfig = {
  target: 'electron-main',
  mode: process.env.NODE_ENV || 'production',
  entry: {
    main: path.join(__dirname, '../src/main/main.js'),
    server: path.join(__dirname, '../src/main/server.js')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      }
    ]
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../dist/electron')
  },
  resolve: {
    extensions: [ '.js', '.json', '.node' ]
  },
  node: {
    __dirname: false
  },
  externals: {
    uws: "uws",
  },
  plugins: [
  ]
}

if (process.env.NODE_ENV === 'production') {
  mainConfig.plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  )
}

module.exports = mainConfig
