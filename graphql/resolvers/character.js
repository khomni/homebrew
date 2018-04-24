const Character = {

  // Associations: additional queries, if asked
  //
  campaign: character => {
    return character.Campaign || character.getCampaign();
  },

  images: character => {
    return character.Images || character.getImages();
  },

  // ItemCollection
  items: (character, args) => {
    return character.items || character.getItems();
  },

  journal: character => {
    return character.journal || character.getJournals();
  },

  knowledge: character => {
    return character.knowledge || character.getKnowledge();
  },

  lore: character => {
    return character.lore || character.getLore();
  },

  permissions: (character, args, context) => {
    return character.getPermission({where:{id: {$not: null}}})
    .then(([user]) => {
      if(!user) return {read: false, write: false, own: false}
      const permissions = user.Permission
      // console.log(JSON.stringify(permissions));
      return permissions
    })
  },
  owner: character => character.getPermission({through: {owner: true}})
}

module.exports = Character
