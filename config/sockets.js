
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

var counter = 0
const COUNTER_MAX = 256

function generateGUID() {
  counter = ++counter % COUNTER_MAX
  let counterString = _.padStart(String(counter), 3, '0');
  let buffer = new Buffer(String(Date.now()) + '-' + counterString)
  return buffer.toString('base64');
}

const connections = {};

function attachWebSockets(server, options = {path: '/'}) {
  return SubscriptionServer.create({
    schema: jsSchema,
    execute,
    subscribe,
    onConnect: (connectionParams, webSocket, context) => {
      let request = webSocket.upgradeReq
      console.log(connectionParams);
      const { jwt } = connectionParams;

      let guid = generateGUID()
      webSocket._guid = guid;
      connections[guid] = webSocket;

      console.log(`${guid} connected (${Object.keys(connections).length})`);

      let { remoteAddress } = request.connection
      let connectionID = generateGUID()

      return { jwt, guid }
    },
    onDisconnect: (connectionParams, webSocket, context) => {
      const guid = webSocket.socket._guid
      if(connections[guid]) console.log(`${guid} disconnected`);
      delete connections[guid]
      // console.log(`${request.connection.remoteAddress} disconnected`)
    }
  }, {
    server: server,
    path: options.path
  })
}

module.exports = {
  attachWebSockets,
  connections
}
