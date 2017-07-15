'use strict';

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

// Serialize Sessions
passport.serializeUser(function(user, done){
  done(null, user);
});

//Deserialize Sessions
passport.deserializeUser(function(user, done){
  return db.User.scope('session').find({ where: {id: user.id} })
  .then(user => {
    return done(null, user)
  })
  .catch(done)
});

// For Authentication Purposes
passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password', passReqToCallback: true},
  function(req, email, password, done){
    var user = db.User.find({where: {$or: [{email: email}, {username: email}]}})
    .then(user => {
      if(!user) return done(null)
      let passwd = user ? user.password : ''
      return db.User.validPassword(password, passwd, user)
      .then(isValid => done(null, isValid) )
    })
    .catch(done)
  }
));

module.exports = passport
