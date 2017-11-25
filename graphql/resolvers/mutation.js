const Mutation = {
  campaign: (root, args, {user}) => {

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
  },

  character: (root, args, {user}) => {
  
  }
}

module.exports = Mutation
