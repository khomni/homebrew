module.exports = (root, {user, id}, {jwt}) => {
  const {name, email, password, password_confirm} = user

  if(password !== password_confirm) throw new Error('Password mismatch')


  if(!id) {
    // verify passwords match
    console.log({name,email,password})
    return db.User.create({name, email, password})
    .catch(err => {
      console.log(JSON.stringify(err,null,'  '));
      throw err
    
    })
  }

  return db.User.find({where: {id}})
  .then(user => {
    console.log(user);

    return jwtInterface.verify(jwt)
    .then(({alias, password}) => {
    
    })
  })

  // modifying user: authenticate first
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
