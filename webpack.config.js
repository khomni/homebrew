'use strict'

const path = require('path');

const BUILD_DIR = path.resolve(__dirname, 'public/javascripts');
const APP_DIR = path.resolve(__dirname, 'build');
const LOCAL = process.env.NODE_ENV === 'local';

let config = {
  entry: {
    main: ['babel-polyfill', APP_DIR + '/main.js'],
    bundle: ['babel-polyfill', APP_DIR + '/react/index.jsx'],
    initiative: ['babel-polyfill', APP_DIR + '/react/initiative.jsx'],
  },
  output: {
    path: BUILD_DIR,
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel-loader'
      },
      // {
      //   test: /\.(css)/,
      //   include: APP_DIR,
      //   use: LOCAL
      //     ? [ 'style-loader', 'css-loader' ]
      //     : ExtractTextPlugin.extract({
      //       fallback: "style-loader",
      //       use: "css-loader"
      //     })
      // },
      // {
      //   test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      //   loader: 'url-loader',
      //   options: {
      //     limit: 10000
      //   }
      // },
      // {
      //   test: /\.(md|txt)$/,
      //   use: ['raw-loader']
      // }
    ]
  },
  plugins: [],
  resolve: {
    extensions: ['.js', '.jsx']
  }
};

module.exports = config;

