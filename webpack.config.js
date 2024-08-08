const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: './src/pro-application-form/app.js',
  output: {
    path: path.resolve(__dirname, "extensions/pro-application-form/assets"),
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
        {
            test: /\.(sa|sc|c)ss$/,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'postcss-loader'
            ],
            sideEffects: true
        }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
        filename: "[name].bundle.css?v=[chunkhash]"
    })
  ]
};