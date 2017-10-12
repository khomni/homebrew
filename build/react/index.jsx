import React from 'react';
import { render } from 'react-dom';

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';

import Promise from 'bluebird';

global.Promise = Promise;

/* ==============================
 * Components
 * ============================== */

// import Navbar from './components/navbar'
import Home from './views/home'
import Dropdown from './components/dropdown'
import Navlink from './components/navlink'

export default class Root extends React.Component {
  constructor(props) {
    super(props);

    this.state = { }
  }

  componentDidMount() {

  }

  render() {
    return (
      <Router>
        <div>
          <nav className="navigation">
            <Link to="/" className="navlink">Home</Link>
            <Dropdown label="Account">
              <Link to="/u" className="navlink">Account</Link>
              <Link to="/u/inbox" className="navlink">Inbox</Link>
            </Dropdown>
            <Dropdown label="Character">
              <Link to="/pc/new" className="navlink">New Character</Link>
            </Dropdown>
            <Dropdown label="Campaign">
              <Link to="/c/" className="navlink">Find Campaigns</Link>
            </Dropdown>
          </nav>

          <div id="content-wrapper" className="marble">

            <Route exact path="/" component={Home}/>

          </div>
        </div>
      </Router>
    )
  }
}

let root = document.getElementById('root')

render(<Root/>, root);
