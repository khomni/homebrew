
const jwtInterface = require('../jwt');

const { totalQuantity, totalValue, totalWeight } = require('./item');

const Query = {}

Query.session = (root, args, context) => {
  const { jwt } = context

  const newSession = { jwt: null, user: null, character: null, campaign: null }

  // TODO: use the context from socket connection to restore a user's session
  // TODO: querying the session

  // with no existing token, the entire session should be returned blank
  if(!jwt) return newSession

  return jwtInterface.verify(jwt)
  .then(({alias, password}) => {

    return db.User.scope('session').find({
      where: { $or: [{email: alias}, {name: alias}] }
    })
    .then(user => {
      if(!user) return newSession; // something changed with the user account since the JWT was signed
      let { MainChar: character } = user;
      let campaign;
      if(character) campaign = character.Campaign;
      let session = { jwt, campaign, character, user }

      return session;
    })
    .catch(err => {
      // any unforseen error in trying to retrieve session information should return an empty session
      console.error('Error retrieving session information:', err);
      
      return newSession
    })
  })
}

Query.user = (root, args, context) => {
  const { campaign, slug } = args

  let query = {};

  if(slug) query.id = slug

  return db.User.findAll({ where: query })

}

Query.campaign = (root, args, context) => {
  const { slug } = args;
  let query = {};
  if(slug) query.url = slug

  return db.Campaign.findAll({where: query})
}

Query.calendar = (root, args, context) => {
  const { id } = args

  let query = { id }

  return db.Calendar.find({where: query})
}

Query.character = (root, args, context) => {

  const {slug, user, search, campaign} = args;

  let query = {};
  if(slug) {
    if(isNaN(slug)) query.url = slug
    else query.id = slug
  }
  if(campaign) query.CampaignId = args.campaign
  if(user) query.ownerId = args.user
  if(search) query.$name = {$iLike: `%${search}%`}
  return db.Character.findAll({where: query})
}

Query.item = (root, args, context) => {
  const { slug, character, item, search } = args

  // master query
  let query = {};
  if(slug) {
    if(isNaN(slug)) query.url = slug
    else query.id = slug
  }
  if(character) {
    query.CharacterId = character
  }

  // slave query
  let slaveQuery = {};
  if(search) slaveQuery.name = {$iLike: `%${search}%`}

  Object.assign(slaveQuery, query);

  return Promise.props({
    items: db.Item.findAll({
      where: slaveQuery,
      include: {model: db.Item, as: 'descendents', hierarchy: true}
    }),
    aggregate: db.Item.findAll({
      where: query,
      attributes: ['id', 'quantity', 'value', 'weight'],
      include: {
        model: db.Item, as: 'descendents', hierarchy: true,
        attributes: ['id', 'quantity', 'value', 'weight'],
      },
    })
    .then(aggregate => ({
      total_weight: totalWeight(aggregate),
      total_quantity: totalQuantity(aggregate),
      total_value: totalValue(aggregate),
    }))
  })
  .then(({items, aggregate: {total_weight, total_quantity, total_value}}) => ({items, total_weight, total_quantity, total_value}))
}

Query.journal = (root, args, context) => {
  const { slug, character, search } = args

  let query = {};
  if(character) query.CharacterId = character
  if(search) query.$or = [{title: {$iLike: `%${search}%`}}, {content: {$iLike: `%${search}%`}}]
  if(slug) {
    if(isNaN(slug)) query.url = slug
    else query.id = slug
  }

  return db.Journal.findAll({ where: query })
}

// knowledge query returns lore organized by topic
Query.knowledge = (root, args, context) => {
  const { slug, character, search } = args
  let query = {}
  // if(character) query.CharacterId = character
  if(search) query.$or = [{title: {$iLike: `%${search}%`}}, {content: {$iLike: `%${search}%`}}]

  if(slug) {
    if(isNaN(slug)) query.url = slug
    else query.id = slug
  }

  // Knowledge

  return db.Lore.findAll({ where: query })
  .then(lore => { // reorganize the lore to be organized by lorable and id
    const knowledge = {}; // aggregate all lore by topic_type::id

    lore.map(entry => {
      if(!knowledge[entry.lorable]) knowledge[entry.lorable] = {}
      if(!knowledge[entry.lorable][entry.lorable_id]) knowledge[entry.lorable][entry.lorable_id] = []
      knowledge[entry.lorable][entry.lorable_id].push(entry)
    })

    // TODO: this query needs to laboriously query each topic, since it's a polymorphic relationship
    // OR: make a resolver that knows how to do this for us... hmmm

    let formattedKnowledge = Object.keys(knowledge).map(key => {
      return {
        topic_name: key,
        topics: Object.keys(knowledge[key]).map(id => ({ 
          topic: { 
            id,
            __type: key
          },
          lore: knowledge[key][id]
        }))
      }
    })

    // console.log(JSON.stringify(formattedKnowledge,null,'  '))

    return formattedKnowledge

    // return knowledge
    // return topics
  })

}

Query.lore = (root, args, context) => {
  const { slug, character, search } = args
  let query = {}
  // if(character) query.CharacterId = character
  if(search) query.$or = [{title: {$iLike: `%${search}%`}}, {content: {$iLike: `%${search}%`}}]

  // TODO: lore queries should group by topic_type and topic
  // TODO: change the schema to organize lore results by topic

  if(slug) query.id = slug

  // TODO: perform this query as some sort of aggregation
  return db.Lore.findAll({where: query })
}

module.exports = Query
