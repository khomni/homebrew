'use strict'

const fs = require('fs');
const path = require('path');
const resolvers = require('./resolvers');
const { makeExecutableSchema } = require('graphql-tools');
const { graphqlExpress } = require('apollo-server-express');
Promise.promisifyAll(fs);


// schema definition
const typeDefs = require('./schema.gql');

// compile the schema from the GraphQL schema language
const jsSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForArgs: false
  }
})

module.exports = graphqlExpress(req => ({
  schema: jsSchema,
  context: {
    user: req.user,
    campaign: req.user && req.user.MainChar && req.user.MainChar.Campaign || null,
  }
}))
