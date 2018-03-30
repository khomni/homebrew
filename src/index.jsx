import Promise from 'bluebird';
global.Promise = Promise;

/* ============================== 
 * React
 * ============================== */

import React from 'react';
import { render } from 'react-dom';

/* ============================== 
 * Redux
 * ============================== */

import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducer from './reducers';

/* ============================== 
 * React/Redux
 * ============================== */

const store = createStore( reducer, applyMiddleware(thunk) );

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
  connectionParams: { 
    // initialization parameters; these will get sent to the onConnect function
    userAgent: navigator.userAgent,
    timezoneOffset: new Date().getTimezoneOffset()
  }
});

const fragmentMatcher = new IntrospectionFragmentMatcher({ introspectionQueryResultData })
const cache = new InMemoryCache({fragmentMatcher})
const link = new WebSocketLink(wsClient);

const logoutLink = onError((err, ...rest) => {
  console.error(err, rest)
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
    <ApolloProvider client={client} store={store}>
      <Router history={browserHistory}>
        <App/>
      </Router>
    </ApolloProvider>
  </Provider>
, root);
