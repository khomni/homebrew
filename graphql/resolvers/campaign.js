const Campaign = {
  quests: campaign => {
    return campaign.Quests || campaign.getQuests({scope: 'nested', where: {hierarchyLevel: 1}});
  }
}

module.exports = Campaign
