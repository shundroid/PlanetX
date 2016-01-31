var webpack = require("webpack");
var settings = require("./webpack-settings");
var exp = {
  entry: {
    ts: "./js/main.ts"
  },
  output: {
    path: settings.distDir,
    filename: settings.distFile
  },
  resolve: {
    extensions: ["", ".tsx", ".ts", ".js"]
  },
  module: {
    loaders: [
      { test: /\.ts(x?)$/, loader: 'ts-loader' },
      { test: /\.less/, loader: 'style!css!less' }
    ]
  },
  plugins: [
    new webpack.optimize.DedupePlugin() // 重複禁止
  ]
};
if (settings.useUglifyJs) {
  exp.plugins.push(new webpack.optimize.UglifyJsPlugin()); // 圧縮する
}
module.exports = exp;