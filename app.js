'use strict';

require('dotenv').config();

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const session = require('express-session');

const sequelize = require('./config/database');
require('./config/globals');
const graphql = require('./graphql');
const graphiql = require('apollo-server-express').graphiqlExpress;
const db = require('./models/index');
const routes = require('./routes');
const requests = require('./middleware/requests');

global.db = db;

const app = express();

// var browserify = require('browserify-middleware');
// app.use('/javascripts', browserify('./build'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', '0.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var marked = require('marked');

app.locals.basedir = APPROOT+'/views';
app.locals.markdown = marked;
app.locals.SYSTEM = SYSTEM;
app.locals.SITE_NAME = global.SITE_NAME = "Homebre.ws";
app.use(Common.middleware.title());

// stylesheets
var lessMiddleware = require('less-middleware');
app.use(lessMiddleware(path.join(__dirname, 'less', '_output'),{
  dest: path.join(__dirname,'public'),
  preprocess: {
    path: (pathname, req) => pathname.replace(path.sep + 'stylesheets' + path.sep, path.sep),
  },
  render: {
    compress: app.get('env') !== 'local'
  },
  once: app.get('env') !== 'local', // only recompile on server restart if in production
}));

app.use(express.static(path.join(__dirname, 'public')));

// pipes images from Amazon AWS s3 service to the result
app.use('/i', require('./middleware/images'));

const logs = require('./config/logs')
app.use(logs); 

app.use((req,res,next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:3000");
  next();
});

app.use('/', (req,res,next)=>{
  if(/\.json(.*)?$/.test(req.url)) {
    req.headers.accept = 'application/json';
    req.url = req.url.replace(/\.json(.*)?$/,'');
  }

  if(/\.html(.*)?$/.test(req.url)) {
    req.headers.accept = 'text/html';
    req.url = req.url.replace(/\.html(.*)?$/,'');
    req.html = true;
  }
  return next();
});

app.use(requests);

// Main Router
app.use('/', routes);

// Error Handlers

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(require('./middleware/error'));

module.exports = app;
