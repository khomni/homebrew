require('dotenv').config();

const webpack = require('webpack');
const path = require('path');

const APP_DIR = path.join(__dirname, '/src');
const BUILD_DIR = path.join(__dirname, '/public/javascripts');

module.exports = {
  entry: {
    app: ['babel-preset-env', path.join(APP_DIR, '/index.jsx')],
    // main: ['babel-preset-env', APP_DIR + '/build/main.js'],
  },
  output: {
    path: BUILD_DIR,
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)?/,
        include: APP_DIR,
        loader: 'babel-loader',
      },
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader',
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
