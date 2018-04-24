const jwtInterface = require('../../jwt');

module.exports = jwtInterface.getUserFromJWT((root, {character: characterInput, id, campaign}, {user}) => {

  if(!user) throw new Error('You must be loggerd in to create a character');

  // start a transaction for updating the character
  return db.sequelize.transaction(transaction => {
    
    return Promise.try(() => {

      // create a new character
      if(!id) {
        return user.createCharacterPermission(characterInput, {own: true, write: true, read: true}, {transaction})
      }

      // query an existing character, and confirm that the user has write access
      return user.getCharacterPermission({where: {id}})
      .then(character => {
        console.log('character permission:', character)
        return character.update(characterInput, {transaction});

      })
    })
    .then(character => {
      // if the character is new or the campaign has not changed, skip campaign operations
      if(character.CampaignId === campaign) return character

      // otherwise, check campaign for permissions / visibility and move the character over
      // return db.Campaign.find({where: {id: campaign}})
      return user.getCampaignPermission({where: {id: campaign}})
      .then(([campaign]) => {
        /*
        console.log('campaign permission:', campaign)
        db._methods(user, /permission|campaign|character/gi);
        db._methods(character, /permission/gi);
        db._methods(campaign, /permission/gi);
        */

        if(!campaign || !campaign.Permission.read) throw Common.error.authorization('You do not have permission to add characters to this campaign')

        // assign the character to the campaign
        return campaign.addCharacter(character)
        .then(() => character)
      })
    })
    // .then(character => user.addCharacterPermission(character, {write: true, read: true}, transaction))
    .then(character => {
      console.log('Character:', character);

      return character.save()
      // throw new Error('hold on')
      // set the remaining fields
    })
  
  })

})

