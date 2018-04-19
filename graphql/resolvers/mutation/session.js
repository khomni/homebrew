const jwtInterface = require('../../jwt');


module.exports = (root, { destroy, session }, context) => {

  const blankSession = { jwt: null }

  if(destroy || !session ) return blankSession
  const { alias, password } = session;

  // logout: session mutation without any credentials
  // if(destroy) {
  if(!alias || !password) return blankSession

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

