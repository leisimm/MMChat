const path = require('path')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

let rendererConfig = {
  target: 'electron-renderer',
  mode: process.env.NODE_ENV || 'production',
  entry: {
    renderer: path.join(__dirname, '../src/renderer/main.js'),
    renderer_add_chat: path.join(__dirname ,'../src/renderer/add_chat.js')
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'underscore-template-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'imgs/[name]-[folder].[ext]'
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name]-[folder].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, '../src/renderer/index.html'),
      chunks: [ 'renderer' ],
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'add_chat.html',
      template: path.join(__dirname, '../src/renderer/add_chat.html'),
      chunks: [ 'renderer_add_chat' ],
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: process.env.NODE_ENV === 'development' ? '"development"' : '"production"'
      }
    })
  ],
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../dist/electron')
  }
}

if (process.env.NODE_ENV === 'development') {
  rendererConfig.devtool = '#cheap-module-eval-source-map'

  rendererConfig.module.rules.push(
    {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader'
      ]
    }
  )
  rendererConfig.module.rules.push(
    {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader',
        'sass-loader'
      ]
    }
  )

  rendererConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  )
}

if (process.env.NODE_ENV === 'production') {
  rendererConfig.module.rules.push(
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader'
      ]
    }
  )
  rendererConfig.module.rules.push(
    {
      test: /\.scss$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader',
        'sass-loader'
      ]
    }
  )
  rendererConfig.plugins.push(
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css',
      chunkFilename: '[id].[contenthash:8].css'
    })
  )
}

module.exports = rendererConfig
