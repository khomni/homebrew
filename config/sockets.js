
const _ = require('lodash');
const crypto = require('crypto');
const cookie = require('cookie');
const passport = require('./passport');

const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');

const resolvers = require('../graphql/resolvers');
const { makeExecutableSchema } = require('graphql-tools');
const { graphqlExpress } = require('apollo-server-express');

const typeDefs = require('../graphql/schema.gql');


// compile the schema from the GraphQL schema language
const jsSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForArgs: false
  }
})

/* ==============================
 * attachWebSockets:
 *      takes: a server and options object
 *      returns: a SubscriptionServer instance
 *
 * onConnect: function that returns the conext for the subscription server
 *      - TODO: should return fully useful session information so the GraphQL server has access to it
 *      - user authorization should also interface with the session storage so users don't have to log in across app-loads
 * ============================== */

const connections = {};

const formatError = error => {
  // log the error
  console.error(error);
  return error
}

const formatResponse = (value) => ({
  ...value,
  errors: value.errors && value.errors.map(formatError)
})

function attachWebSockets(server, options = {path: '/'}) {
  return SubscriptionServer.create({
    schema: jsSchema,
    execute,
    subscribe,
    onConnect: (connectionParams, webSocket, context) => {
      let request = webSocket.upgradeReq
      const { jwt } = connectionParams;

      return Common.guid.generateGuid()
      .then(guid => {

        webSocket._guid = guid;
        connections[guid] = webSocket;

        let { remoteAddress } = request.connection
        return { jwt, guid }
      })
      // let guid = generateGUID()
    },
    onDisconnect: (connectionParams, webSocket, context) => {
      const guid = webSocket.socket._guid
      // if(connections[guid]) console.log(`${guid} disconnected`);
      delete connections[guid]
      // console.log(`${request.connection.remoteAddress} disconnected`)
    },
    onError: (err, ...rest) => {
      console.error('Socket error:', err);
      console.error(rest);
    },
    onOperation: (message, params, webSocket) => {
      params.formatResponse = formatResponse
      return params
    }
  }, {
    server: server,
    path: options.path,
  })
}

module.exports = {
  attachWebSockets,
  connections
}
