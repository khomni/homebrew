const Query = require('./query');
// const Mutation = require('./mutation');
const User = require('./user');
const Character = require('./character');
const { Item, ItemCollection } = require('./item');
const Lore = require('./lore');
const Campaign = require('./campaign');

const Node = {

  __resolveType(obj, context, info) {
    return obj.$modelOptions.name.singular
  }
}

const resolvers = {
  Campaign,
  Character,
  Item,
  ItemCollection,
  Lore,
  Node,
  User,
  Query
};

module.exports = resolvers
