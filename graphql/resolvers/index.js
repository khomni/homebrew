const Query = require('./query');
// const Mutation = require('./mutation');
const User = require('./user');
const Character = require('./character');
const { Item, ItemCollection } = require('./item');
const Lore = require('./lore');
const Campaign = require('./campaign');
const { Comment, CommentSection }= require('./comment');
const Quest = require('./quest');

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
  ItemCollection,
  Lore,
  Node,
  User,
  Query,
  Quest,
};

module.exports = resolvers
