require('dotenv').config();

const webpack = require('webpack');
const path = require('path');

const APP_DIR = path.join(__dirname, '/build');
const BUILD_DIR = path.join(__dirname, '/public/javascripts');

module.exports = {
  entry: {
    main: ['babel-preset-env', APP_DIR + '/main.js'],
    bundle: ['babel-preset-env', APP_DIR + '/react/index.jsx'],
    widgets: ['babel-preset-env', APP_DIR + '/react/widgets.jsx'],
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
        loader: 'babel-loader',
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  }
}
