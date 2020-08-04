const webpack = require('webpack')
const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {version} = require('./package.json')

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'
  const isDocs = process.env.NODE_ENV === 'docs'
  const API_URL = {
    production: JSON.stringify('https://cm-api.chinamakes.ru//api/activities/add'),
    development: JSON.stringify('http://localhost:3000/api/activities/add'),
  }

  return {
    entry: [
      './src/index.js',
    ],
    output: {
      path: __dirname,
      publicPath: '/',
      filename: isDocs ? `./docs/cm-v${version}.min.js` : `./dist/cm-v${version}.min.js`,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
    devtool: isProduction ? false : 'cheap-inline-module-source-map',
    optimization: {
      minimize: isProduction,
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 9000,
      watchContentBase: true,
      progress: true,
      stats: 'errors-only',
    },
    plugins: [
      isProduction ? new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: ['dist'],
      }) : () => {
      },
      !isProduction ? new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'index.html',
        inject: true,
      }) : () => {
      },
      new webpack.DefinePlugin({
        API_URL: API_URL[argv.mode],
      }),
    ],
  }
}
