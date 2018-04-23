const jwtInterface = require('../../jwt');

module.exports = jwtInterface.getUserFromJWT((root, {character: characterInput, id, campaign}, {user}) => {

  if(!user) throw new Error('You must be loggerd in to create a character');

  // existing character, modify in place
  if(id) {
    return db.Character.find({where: {id}})
    .then(character => {
      return character.checkPermission(character, {write: true})
      .then(permission => {
        if(!permission) throw Common.error.authorization('You do not have permission to modify this character')
        return character.update(characterInput)
      })
    })
  }

  if(!campaign) throw new Error('Campaign required')

  return db.Campaign.find({where: {id: campaign}})
  .then(campaign => {

    return Promise.try(() => {
      if(campaign.privacy_level !== 'hidden') return true
      return user.checkPermission(campaign, {read: true})
    })
    .then(permission => {
      if(!permission) throw Common.error.authorization('You do not have permission to add characters to this campaign')

      console.log(db._methods(campaign, /character/gi));

      return campaign.addCharacter(characterInput)
      .then(character => {
        console.log('added character:', character);
      })
    })
  })
})

