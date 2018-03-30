
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


// TODO: find convenient way to authenticate the session information to send as context to the socket connection
const obtainSession = Promise.method(connectSID => {
  return {connectSID}
})

function attachWebSockets(server, options = {path: '/'}) {
  return SubscriptionServer.create({
    schema: jsSchema,
    execute,
    subscribe,
    onConnect: (connectionParams, webSocket, context) => {

      // TODO: get session information from session-store to send to the context on connection
      // mannually get connect.sid from cookies to use the session store
      // man, what a pain in the ass
      let cookies = cookie.parse(context.request.headers.cookie)
      let connectSID = cookies['connect.sid'];

      if(!cookies['connect.sid']) return false;

      return obtainSession(cookies['connect.sid'])
    },
  }, {
    server: server,
    path: options.path
  })
}

module.exports = {
  attachWebSockets
}
