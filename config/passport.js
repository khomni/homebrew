var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy

// Serialize Sessions
passport.serializeUser(function(user, done){
  done(null, user);
});

//Deserialize Sessions
passport.deserializeUser(function(user, done){
  return db.User.find({where: {id: user.id}})
  .then(user => done(null, user))
  .catch(err => done(err, null))
});

// For Authentication Purposes
passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password',passReqToCallback: true},
  function(req, email, password, done){
    console.log("[Passport] Using Local Strategy")
    var user = db.User.find({where: {$or: [{email: email}, {username: email}]}})
    .then(user => {
      if(!user) return done(null)
      passwd = user ? user.password : ''
      db.User.validPassword(password, passwd, done, user)
    })
    .catch(err => {
      console.error(err);
      done(err, null);
    })
  }
));
