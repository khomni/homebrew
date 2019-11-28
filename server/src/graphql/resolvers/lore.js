const Lore = {
  owner: lore => lore.owner || lore.getOwner(),
  topic_type: lore => lore.lorable,
  topic: lore => db[lore.lorable].find({where: {id: lore.lorable_id}}),
}

// populate the topic based on 
// take THAT, polymorphic associations
const LoreList = {
  topic: ({topic: {id, __type}}) => db[__type].find({where: {id}})
}

module.exports = { Lore, LoreList }
