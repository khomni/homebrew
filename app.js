require('dotenv').config();
var path = require('path');
global.APPROOT = path.resolve(__dirname);
require('./config/globals');

var express = require('express');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var sequelize = require(APPROOT+'/config/database')
var SequelizeStore = require('connect-sequelize')(session)

var app = express();

app.use(cookieParser());
var sessionMiddleware = session({
  secret: 'brulesrules',
  store: new SequelizeStore(sequelize,{},'Session'),
  proxy:true,
  resave:false,
  saveUninitialized: true,
})

app.use(require(APPROOT+'/middleware/requests'));

SALT_WORK_FACTOR = 12;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', '0.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(sessionMiddleware);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

app.locals.basedir = APPROOT+'/views'

app.use((req,res,next) => {
  res.locals.currentUser = req.user || false
  next();
});

var browserify = require('browserify-middleware');
app.use('/javascripts', browserify('./build'));

// stylesheets
var lessMiddleware = require('less-middleware');
app.use(lessMiddleware(path.join(__dirname, 'less', '_output'),{
  dest: path.join(__dirname,'public'),
  preprocess: {
    path: function(pathname, req) { // given a path, returns the same path with "/stylesheets/" replaced by "/"
      return pathname.replace(path.sep + 'stylesheets' + path.sep, path.sep);
    }
  },
  render: {
    compress: app.get('env') !== 'local'
  },
  once: app.get('env') !== 'local', // only recompile on server restart if in production
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(logger('dev'));

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

// set the user's main character if applicable
app.use(require(APPROOT+'/middleware/activeChar'));

// router
app.use('/', require(APPROOT+'/routes/index'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development'||app.get('env') === 'local') {
  app.use(function(err, req, res, next) {

    res.status(err.status || 500);

    console.error(err.stack)

    if(req.requestType('json')) return res.status(err.status).send(err)
    if(req.requestType('modal')) return res.render('modals/_error', {message: err.message, error: err})
    return res.render('error', {message: err.message, error: err})

  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
