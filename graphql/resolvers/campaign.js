const Campaign = {
  quests: campaign => {
    return campaign.Quests || campaign.getQuests({scope: 'nested', where: {hierarchyLevel: 1}});
  },
  owner: campaign => campaign.getOwner(),

  total_characters: campaign => db.Character.count({where: {CampaignId: campaign.id}}),
  total_users: campaign => {
    return db.User.count({
      include: [{
        model: db.Character,
        as: 'characters',
        where: {CampaignId: campaign.id}
      }],
      distinct: true
    })
  },
  total_lore: campagin => {},
  total_quests: campaign => {},
  total_events: campaign => {},
}

module.exports = Campaign
