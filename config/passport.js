'use strict';

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

// Serialize Sessions
passport.serializeUser((user, done) => done(null, user) );

//Deserialize Sessions
passport.deserializeUser((user, done) => {
  return db.User.scope('session').find({ where: {id: user.id} })
  .then(user => done(null, user) )
  .catch(done)
});

// For Authentication Purposes
passport.use(new LocalStrategy({usernameField: 'user', passwordField: 'password', passReqToCallback: true},
  function(req, username, password, done){
    return db.User.find({
      where: {
        $or: [{email: username}, {username: username}]
      }
    })
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
