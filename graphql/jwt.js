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
  authenticateUser(alias, password, options) {
    // abstraction layer to modularize shared code between verifying and signing

    let invalidCredentialsError = new Error('Invalid Login Credentials');

    return db.User.find({
      where: { $or: [{email: alias}, {username: alias}] },
      include: {
        model: db.Character,
        as: 'MainChar',
      }
    })
    .then(user => {
      if(!user) throw invalidCredentialsError;

      return db.User.validPassword(password, user.password, user)
      .then(isValid => {
        if(!isValid) throw invalidCredentialsError;

        return user
      })
    })

  }
}

module.exports = TokenInterface
