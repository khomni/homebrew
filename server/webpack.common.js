require('dotenv').config();

const webpack = require('webpack');
const path = require('path');

const APP_DIR = path.join(__dirname, '/src');
const BUILD_DIR = path.join(__dirname, '/public/javascripts');

module.exports = {
  entry: "./src/index.ts",
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [ ],
}
