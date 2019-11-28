import Promise from 'bluebird'
global.Promise = Promise
import {RuleSets as SYSTEM} from '../system'
global.SYSTEM = SYSTEM

/* ============================== 
 * React
 * ============================== */

import React from 'react';
import { render } from 'react-dom';

/* ============================== 
 * Redux
 * ============================== */

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'

import { store, persistor } from './configureStore'

import { BrowserRouter as Router, browserHistory } from 'react-router-dom';

/* ==============================
 * Apollo
 * ============================== */

import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache,  IntrospectionFragmentMatcher  } from 'apollo-cache-inmemory';
import introspectionQueryResultData  from '../graphql/introspection.json';
import { HttpLink, createHttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { WebSocketLink } from "apollo-link-ws";


// bullshit cuntfucking ass-garbage that doesn't work and has shitty / no documentation
const wsClient = new SubscriptionClient('ws://localhost:3000/', {
  reconnect: true,
  connectionParams() {
    // get persistent storage to include authorization details in
    // since the store session gets updated each time the query is run, this will contain the session information last known by the client
    let storeState = store.getState()
    let storeSession = storeState.session || { jwt: null, user: null, character: null, campaign: null }
    let jwt = storeSession.jwt

    console.log('Redux persistent storage:', storeState);

    return {
      jwt,
      userAgent: navigator.userAgent,
      timezoneOffset: new Date().getTimezoneOffset()
    }
  }
});

const fragmentMatcher = new IntrospectionFragmentMatcher({ introspectionQueryResultData })
const cache = new InMemoryCache({fragmentMatcher})
const link = new WebSocketLink(wsClient);

const logoutLink = onError((err) => {
  console.error(err);
})

const client = new ApolloClient({ 
  cache,
  fragmentMatcher,
  link: logoutLink.concat(link),
});

/* ==============================
 * Components
 * ============================== */

// import Navbar from './components/navbar'
import App from './containers/App';

let root = document.getElementById('root')

render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ApolloProvider client={client} store={store}>
        <Router history={browserHistory}>
          <App/>
        </Router>
      </ApolloProvider>
    </PersistGate>
  </Provider>
, root);
