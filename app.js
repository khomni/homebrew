require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var lessMiddleware = require('less-middleware');

var passport = require('passport')

var app = express();

global.appRoot = path.resolve(__dirname);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', '0.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){

  if (!app.locals.vignettes) {
    var vignette = require('./middleware/vignette.js');
    vignette.getVignettes(function(files){
      app.locals.vignettes = files
      return next();
    });
  }
  else {
    next();
  }
})

var browserify = require('browserify-middleware');
app.use('/javascripts', browserify('./build'));

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

app.use('/', routes);
app.use('/users', users);

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
    res.render('error', {
      message: err.message,
      error: err
    });
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
