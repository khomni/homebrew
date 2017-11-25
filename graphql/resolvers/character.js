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
}

module.exports = Character
