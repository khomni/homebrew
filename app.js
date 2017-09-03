'use strict';

require('dotenv').config();
var path = require('path');
// global.APPROOT = path.resolve(__dirname);
require('./config/globals');

var express = require('express');

var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var sequelize = require(APPROOT+'/config/database');
var db = require(APPROOT+'/models/index');
global.db = db;

var app = express();

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
    path: pathname => pathname.replace(path.sep + 'sytlesheets' + path.sep, path.sep),
  },
  render: {
    compress: app.get('env') !== 'local'
  },
  once: app.get('env') !== 'local', // only recompile on server restart if in production
}));

app.use(express.static(path.join(__dirname, 'public')));

// pipes images from Amazon AWS s3 service to the result
app.use('/i', require('./middleware/images'));

app.use(require('./config/logs')); 
// set up the vignettes for the header and homepage
app.use(require('./middleware/vignette'));

app.use(function(req,res,next){
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:3000");
  next();
});

// SESSION

var SequelizeStore = require('connect-sequelize')(session);

app.use(cookieParser());

var sessionMiddleware = session({
  secret: 'brulesrules',
  store: new SequelizeStore(sequelize,{},'Session'),
  proxy:true,
  resave:false,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

var passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) => {
  // permission object passed between routers to determine the level of permission available to the user
  // res.locals.permission = {write: false, read: false}
  Object.seal(res.locals.permission);

  res.locals.currentUser = req.user || false;
  res.locals.THEME = req.session.theme || 'marble';
  res.locals.breadcrumbs = [];
  next();
});

// set the user's main character if applicable
app.use(require('./middleware/activeChar'));

app.use('/', (req,res,next)=>{
  if(/\.json(.*)?$/.test(req.url)) {
    req.headers.accept = 'application/json';
    req.url = req.url.replace(/\.json(.*)?$/,'');
  }
  return next();
});

app.use(require('./middleware/requests'));

// Main Router
app.use('/', require('./routes/index'));

// Error Handlers

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(require('./middleware/error'));

module.exports = app;
