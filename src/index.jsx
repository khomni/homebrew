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

import { BrowserRouter as Router } from 'react-router-dom';

import Promise from 'bluebird';
global.Promise = Promise;

/* ==============================
 * Components
 * ============================== */

// import Navbar from './components/navbar'
import App from './containers/App';

let root = document.getElementById('root')

render(
  <Provider store={store}>
    <Router>
      <App/>
    </Router>
  </Provider>
, root);
