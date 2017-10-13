import React from 'react';

import Dropdown from './dropdown'

import {
  BrowserRouter as Router,
  Route, Switch,
  Link, NavLink
} from 'react-router-dom';

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
  }

  // use this to get information about a resource and deliver it to the root
  // this also depends on a corresponding react component to display the resource

  render() {
    return (
      <nav className="navigation">
        <Dropdown label="?" >
          <NavLink to="/account" className="navlink" activeClassName="active"> Account </NavLink>
          <NavLink to="/messages" className="navlink" activeClassName="active"> Inbox </NavLink>
          <NavLink to="/logout" className="navlink" activeClassName="active"> Log Out </NavLink>
        </Dropdown>

        <Dropdown label="Campaign">
          <NavLink to="/c/" className="navlink" activeClassName="active"> Campaigns </NavLink>
          <NavLink to="/c/new" className="navlink" activeClassName="active"> New Campaign </NavLink>
        </Dropdown>

        <Dropdown label="Character">
          <NavLink to="/pc" className="navlink" disabled={!this.props.campaign} activeClassName="active">New Character</NavLink>
          <NavLink to="/pc/new" className="navlink" disabled={!this.props.campaign} activeClassName="active">New Character</NavLink>
        </Dropdown>

      </nav>
    )

  }
}
