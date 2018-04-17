const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

Promise.promisifyAll(jwt);

const TokenInterface = {
  sign(json, options) {
    return jwt.signAsync(json, JWT_SECRET, options);
  },
  verify(token, options) {
    return jwt.verifyAsync(token, JWT_SECRET, options);
  },

  // user should be authenticated on each sensitive request
  authenticateUser(alias, password, options) {
    // abstraction layer to modularize shared code between verifying and signing

    let invalidCredentialsError = new Error('Invalid Login Credentials');

    return db.User.scope('authenticate').find({
      where: { $or: [{email: alias}, {username: alias}] },
    })
    .then(user => {
      // user with email or username does not exist
      if(!user) throw invalidCredentialsError;

      return db.User.validPassword(password, user.password, user)
      .then(isValid => {
        // provided password is incorrect
        if(!isValid) throw invalidCredentialsError;

        // login information is correct
        return user
      })
    
    })
  },

  // get a user document from a signed JWT
  // use this a form of middleware for graphql mutations or queries
  getUserFromJWT(resolver) {

    // returns a function that reads the context JWT, and attaches the corresponding user information to the context
    return (root, args, context ) => {
      const { jwt } = context

      return this.verify(jwt)
      .then(({alias, password}) => this.authenticateUser(alias, password))
      .then( user => {
        context.user = user;
      
        return resolver(root, args, context);
      })
      // if everything checks out
    }
  
  }
}

module.exports = TokenInterface
