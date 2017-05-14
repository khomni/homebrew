var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy

// Serialize Sessions
passport.serializeUser(function(user, done){
  done(null, user);
});

//Deserialize Sessions
passport.deserializeUser(function(user, done){
  return db.User.find({
    where: {id: user.id},
    include: [{
      model:db.Character,
      as:'MainChar',
    }]
  })
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
      passwd = user ? user.password : ''
      return db.User.validPassword(password, passwd, user)
      .then(isValid =>{return done(null, isValid)})
    })
    .catch(done)
  }
));
