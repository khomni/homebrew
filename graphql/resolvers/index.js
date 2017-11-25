const Query = require('./query');
// const Mutation = require('./mutation');
const Campaign = require('./campaign');
const Character = require('./character');
const { Comment, CommentSection }= require('./comment');
const { Item } = require('./item');
const Lore = require('./lore');
const Quest = require('./quest');
// const Session = require('./session');
const User = require('./user');

const Node = {

  __resolveType(obj, context, info) {
    return obj.$modelOptions.name.singular
  }
}

const DateTime = require('graphql-date')

const resolvers = {
  Campaign,
  Character,
  Comment,
  CommentSection,
  DateTime,
  Item,
  Lore,
  Node,
  User,
  Query,
  Quest,
};

module.exports = resolvers
