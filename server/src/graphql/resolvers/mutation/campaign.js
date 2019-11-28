const jwtInterface = require('../../jwt');

module.exports = jwtInterface.getUserFromJWT((root, {campaign: campaignInput, id}, {user}) => {

  /* ==============================
   * Campign Mutation:
   *    id: ID (if modifying)
   *    url: (String) custom url slug (if creating, must be unique)
   *    name: (String) the display name of the campaign
   *    system: (String) the linked game system; corresponds to a key in the core systems module
   *    privacy_level: (String)
   * ============================== */

  if(!user) throw new Error('You must be logged in to create/modify a campaign')

  return db.sequelize.transaction(transaction => {
    // new campaign: if no ID is provided, create a new campaign giving the current user full permissions
    if(!id) return user.createCampaignPermission(campaignInput, {own: true, read: true, write: true}, {transaction})

    // existing campaigns: get the user's permissions for this campaign
    // if the 
    return user.getCampaignPermission({where: {id}, through: {write: true}})
    .then(([campaign]) => {
      if(!campaign || !campaign.Permission.write) throw Common.error.authorization('You do not have permission to modify this campaign')
      return campaign.update(campaignInput, {transaction})
    
    })
  
  })
})
