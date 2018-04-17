const Campaign = require('./campaign');
const { Calendar, EventConnection, Year, Month, Week, Day, Event } = require('./calendar');
const Character = require('./character');
const { Comment, CommentSection }= require('./comment');
const { Item } = require('./item');
const Journal = require('./journal');
const { Lore, LoreList } = require('./lore');
const Quest = require('./quest');
// const Session = require('./session');
const User = require('./user');

const Mutation = require('./mutation');
const Query = require('./query');
const Subscription = require('./subscription');
const System = require('./system');

const Node = {
  __resolveType(obj, context, info) {
    let modelName = Object.get(obj, '$modelOptions.name.singular') || Object.get(obj, '__type')
    return modelName || 'Node'
  }
}

const DateTime = require('graphql-date')

const resolvers = {
  Calendar,
  Campaign,
  Character,
  Comment,
  CommentSection,
  DateTime,
  Day,
  Event,
  EventConnection,
  Item,
  Journal,
  Lore,
  LoreList,
  Month,
  Node,
  User,
  Quest,
  System,
  Week,
  Year,

  Query,
  Mutation,
  Subscription,
};

module.exports = resolvers
