const Campaign = {
  quests: campaign => {
    return campaign.Quests || campaign.getQuests({scope: 'nested', where: {hierarchyLevel: 1}});
  },

  total_characters: campaign => db.Character.count({where: {CampaignId: campaign.id}}),
  total_users: campaign => {

    // count all users with campaign permissions
    return db.User.count({
      include: [{
        model: db.Campaign,
        where: {id: campaign.id},
        as: 'campaignPermission',
        through: {
          model: db.Permission,
        }
      }],
      distinct: true
    })
  },
  total_lore: campagin => {},
  total_quests: campaign => {},
  total_events: campaign => {},

  owner: campaign => 
    campaign.getPermission({through: {owner: true}})
    .then(array => array[0]),

  permissions: campaign => {

    // TODO: fix the way context is received on requests
    return campaign.getPermission()
    .then(([user]) => {
      if(!user) return {read: false, write: false, own: false}
      const permissions = user.Permission
      // console.log(JSON.stringify(permissions));
      return permissions

    
    })
  }
}

module.exports = Campaign
