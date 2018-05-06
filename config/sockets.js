
const colors = require('colors');
const _ = require('lodash');
const crypto = require('crypto');
const cookie = require('cookie');
const passport = require('./passport');

const { SubscriptionServer } = require('subscriptions-transport-ws');
const { execute, subscribe } = require('graphql');

const resolvers = require('../graphql/resolvers');
const { makeExecutableSchema } = require('graphql-tools');
const { graphqlExpress } = require('apollo-server-express');

const typeDefs = require('../graphql/schema');


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
  let { originalError } = error;
  // add timestamp for ordering
  error.timestamp = new Date();
  // create a unique ID for this error so the client can track it
  error.id = Common.utilities.generateGUID();
  let [location] = error.locations
  if(error.path) console.error(colors.red(`Error: [${error.path.join(' > ')}] {${location.line},${location.column}}`))

  // Special error formats for other originalError attributes
  //    1. SQL errors: show the original query
  if(!originalError) return error
  if(originalError.sql) {

    // multiple passes:
    let formattedSQL = 
      originalError.sql.split(/(?=SELECT|FROM|WHERE)/g).map(sql =>
        sql.split(/(?=AND|OR)/g).join('\n\t\t')
      ).join('\n\t')

    // let formattedSQL = originalError.sql.replace(/(WHERE|FROM)/g, '\n\t$1 ')
    // console.error(Object.keys(originalError.original));
    console.error(colors.red(`${originalError.name}: ${originalError.message} (${originalError.original.routine})`))
    console.error(colors.red(formattedSQL))
  } else {
    console.error(colors.red(originalError.stack))
  }
  // console.error(Object.keys(originalError))
  return error
}

/*
const formatResponse = (value, ...rest) => {
  return { ...value, errors: value.errors && value.errors.map(formatError) }
}
*/

// given an object, recursively traverses its fields looking for multipart form data
function recursiveMultipartConversion(obj) {

}

const formatResponse = (value) => {

  // recursively examine the variables for multipart file data

  return {...value, errors: value.errors && value.errors.map(formatError)}
}

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
