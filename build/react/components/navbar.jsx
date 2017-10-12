import React from 'react';

import Dropdown from './dropdown'
import Navlink from './navlink'

import {
  BrowserRouter as Router,
  Route,
  Link
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
          <Navlink> Account </Navlink>
          <Navlink> Inbox </Navlink>
          <Navlink> Log Out </Navlink>
        </Dropdown>

        <Dropdown label="Campaign">
          <Navlink href="/c/new" > New Campaign </Navlink>
          <Navlink href="/c/" view="Campaign" {...this.props}> Campaigns </Navlink>
        </Dropdown>

        <Dropdown label="Character">
          <Navlink disabled={!this.props.campaign} href="/pc/new">New Character</Navlink>
        </Dropdown>

      </nav>
    )

  }
}
