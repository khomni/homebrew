const Query = {}

Query.session = (root, args, context) => {
  return context.user
  return db.User.scope('session').find({ where: {id: context.user.id} })
}

module.exports = Query
