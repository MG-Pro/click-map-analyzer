const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'

  return {
    entry: [
      './src/index.js',
    ],
    output: {
      path: __dirname,
      publicPath: '/',
      filename: './dist/cm.js',
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
      minimize: false,
    },
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      port: 9000,
      watchContentBase: true,
      progress: false,
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
    ],
  }
}
