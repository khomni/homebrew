import Query from './query';
import Mutation from './mutation';
import Subscription from './subscription';

const Node = {
  __resolveType(obj, context, info) {
    let modelName =
      Object.get(obj, '$modelOptions.name.singular') ||
      Object.get(obj, '__type');
    return modelName || 'Node';
  }
};

const DateTime = require('graphql-date');

const resolvers = {};

module.exports = resolvers;
