
module.exports = (root, { session: {alias, password, destroy} }, context) => {

  // logout: session mutation without any credentials
  // if(destroy) {
  if(!alias || !password) return { jwt: null }

  return jwtInterface.authenticateUser(alias, password)
  .then(() => jwtInterface.sign({alias, password}))
  .then(jwt => { // guaranteed to return a user; throws error if invalid


    return db.User.scope('session').find({
      where: { $or: [{email: alias}, {name: alias}] }
    })
    .then(user => {
      let { MainChar: character } = user;
      let campaign;
      if(character) campaign = character.Campaign;
      let session = { jwt, campaign, character, user }

      return session;
    })
  })
}

