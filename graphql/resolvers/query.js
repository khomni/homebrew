const { totalQuantity, totalValue, totalWeight } = require('./item');

const Query = {}

Query.session = (root, args, context) => {

  console.log('onConnect session context:', context);
  // TODO: use the context from socket connection to restore a user's session

  return {
    campaign: context.user && context.user.MainChar && context.user.MainChar.Campaign || null, 
    character: context.user && context.user.MainChar || null,
    user: context.user || null,
  }
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

module.exports = Query
