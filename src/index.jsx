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

const fragmentMatcher = new IntrospectionFragmentMatcher({ introspectionQueryResultData })

const cache = new InMemoryCache({fragmentMatcher})

const link = createHttpLink({
  uri: '/graphql',
  credentials: 'same-origin'
})

const logoutLink = onError((err) => {
  console.error(err)
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
