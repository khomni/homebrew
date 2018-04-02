const jwtInterface = require('../jwt');

const Mutation = {};

// User login
Mutation.session = (root, { session: {alias, password} }, context) => {

  return jwtInterface.authenticateUser(alias, password)
  .then(user => { // guaranteed to return a user; throws error if invalid
    let { MainChar: character } = user;
    let campaign;
    if(character) campaign = character.Campaign;

    return jwtInterface.sign({alias, password})
    .then(jwt => ({ user, jwt, campaign, character }))
  })

}

Mutation.campaign = (root, args, {user}) => {

  if(campaign.id) {
    return user.createCampaign(args.campaign)
    .then(campaign => {
      return user.addPermission(campaign, {owner: true, read:true, write:true})
      .then(() => campaign)
    })
  }

  return db.Campaign.findOne({where: {id: campaign.id}})
  .then(campaign => {
    return user.checkPermission(campaign, {write: true})
    .then(permission => {
      if(!permission) throw Common.error.authorization('You do not have permission to modify this campaign')
      return campaign.update(args.campaign)
    })
  })
}

Mutation.character = (root, args, {user}) => {
  
}


module.exports = Mutation
