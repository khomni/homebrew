var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , db = require('../models')

// Serialize Sessions
passport.serializeUser(function(user, done){
  console.log("[Log in] serializing user: ", user.get({plain:true}));
  done(null, user);
});

//Deserialize Sessions
passport.deserializeUser(function(user, done){
  db.User.find({where: {id: user.id}})
  .then(user => done(null, user))
  .catch(err => done(err, null))
});

// For Authentication Purposes
passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password',passReqToCallback: true},
  function(req, email, password, done){
    console.log("[Passport] Using Local Strategy")
    var user = db.User.find({where: {email: email}})
    .then(user => {
      if(!user) {
        console.log('╨ user does not exist');
        return done(null)
      }
      console.log("  ╠═ user: ", user.get({plain:true}))
      passwd = user ? user.password : ''
      console.log("  ╚═ passwd: ", passwd)
      db.User.validPassword(password, passwd, done, user)
    })
    .catch(err => {
      console.error(err);
      done(err, null);
    })
  }
));
