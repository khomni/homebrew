const Query = require('./query');
const Mutation = require('./mutation');
const Campaign = require('./campaign');
const { Calendar, EventConnection, Year, Month, Week, Day, Event } = require('./calendar');
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
  Lore,
  Month,
  Mutation,
  Node,
  User,
  Query,
  Quest,
  Week,
  Year,
};

module.exports = resolvers
