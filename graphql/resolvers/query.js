const Query = {}

Query.session = (root, args, context) => {

  return {
    campaign: context.user && context.user.MainChar && context.user.MainChar.Campaign || null, 
    character: context.user && context.user.MainChar || null,
    user: context.user || null,
  }
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
  if(search) query.$name = {$iLike: `%${args.search}%`}
  console.log(query);
  return db.Character.findAll({where: query})
}

module.exports = Query
