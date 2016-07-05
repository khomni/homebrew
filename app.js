require('dotenv').config();
var express = require('express');
var path = require('path');
global.APPROOT = path.resolve(__dirname);
global.CONFIG = require('./config');
global.Common = require('./common');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')

var routes = require('./routes/index');
var lessMiddleware = require('less-middleware');

var db = require('./models');

var app = express();


SALT_WORK_FACTOR = 12;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', '0.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'brulesrules',
  resave: false,
  saveUninitialized: true
}));

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

app.use((req,res,next) => {
  res.locals.currentUser = req.user || false
  next();
});

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

app.use((req,res,next) => {
  if (!app.locals.vignettes) {
    var vignette = require('./middleware/vignette.js');
    vignette.jsonify((err) => {
      if(err){
        next(err);
      }
      var vignettes = require('./data/vignettes.json');
      app.locals.vignettes = vignettes;
      next();
    })
  }
  else {
    next();
  }
});

app.use(function(req,res,next){
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:3000");
  next();
});

app.use((req,res,next) => {
  if(req.user && req.user.MainCharId && (!req.session.activeChar || req.session.activeChar.id != req.user.MainCharId)) {
      console.log("retrieving activeChar")
      db.Character.findOne({where: {id: req.user.MainCharId}}).then(pc =>{
        req.session.activeChar = pc.get({plain:true})
        res.locals.activeChar = req.session.activeChar
        next();
      })
  } else if(req.session.activeChar && req.user.MainCharId){
    res.locals.activeChar = req.session.activeChar
    next()
  } else {
    res.locals.activeChar = null
    next()
  }
})

app.use('/', routes);

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

    Common.handleRequest(req, {
      json:() => {return res.status(err.status).send(err)},
      xhr:() => {return res.render('modals/_error', {message: err.message, error: err})},
      default:() => {return res.render('error', {message: err.message, error: err})}
    })();

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
