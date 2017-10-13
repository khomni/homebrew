import React from 'react';
import { render } from 'react-dom';

import {
  BrowserRouter as Router,
  Route,
  Link, NavLink,
  Media,
} from 'react-router-dom';

import Promise from 'bluebird';

global.Promise = Promise;

/* ==============================
 * Components
 * ============================== */

// import Navbar from './components/navbar'
import Home from './views/home'
import Navbar from './components/navbar'

export default class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = { }
  }

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <Navbar {...this.props}/>
        <div id="content-wrapper" className="marble">

          <Route exact path="/" component={Home}/>

        </div>
      </div>
    )
  }
}

let root = document.getElementById('root')

render(
  <Router>
    <Root/>
  </Router>
  , root);
