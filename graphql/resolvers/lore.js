const Lore = {
  owner: lore => {
    return lore.owner || lore.getOwner();
  },
  topic: lore => {
    return db[lore.lorable].find({where: {id: lore.lorable_id}})
  }
}

module.exports = Lore
