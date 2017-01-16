require('dotenv').config();
var path = require('path');
// global.APPROOT = path.resolve(__dirname);
require('./config/globals');

var express = require('express');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var sequelize = require(APPROOT+'/config/database')

var app = express();

// connect to the databse before doing anything else
sequelize.sync()
.then(() => {return require(APPROOT+'/models')})
.then(db => {
  global.db = db

  var SequelizeStore = require('connect-sequelize')(session);

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

  var marked = require('marked');

  app.locals.basedir = APPROOT+'/views'
  app.locals.markdown = marked
  app.locals.SYSTEM = SYSTEM

  app.use((req,res,next) => {
    // permission object passed between routers to determine the level of permission available to the user
    res.locals.permission = {write: false, read: false}
    Object.seal(res.locals.permission)

    res.locals.currentUser = req.user || false
    res.locals.THEME = req.session.theme || 'marble'
    res.locals.breadcrumbs = new Common.utilities.Breadcrumbs()
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

  app.use('/json', (req,res,next)=>{
    req.headers.accept = 'application/json'
    return next();
  }, require(APPROOT+'/routes/index'))

  // router
  app.use('/', require(APPROOT+'/routes/index'));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handler
  app.use(require(APPROOT+'/middleware/error'))

})
.catch(err => {
  console.error('Fatal Error: error initializing application')
  console.error(err.stack)
  process.exit();
})


module.exports = app;
