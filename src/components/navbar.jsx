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
    const { session } = this.props;
    const { user, character, campaign } = session

    return (
      <nav className="navigation">
        { user ? (
          <Dropdown label={user && user.username || "?"} >
            <NavLink to={user.url} className="navlink" activeClassName="active"> Account </NavLink>
            <NavLink to="/messages" className="navlink" activeClassName="active">Inbox</NavLink>
            <NavLink to="/logout" className="navlink" activeClassName="active">Log Out</NavLink>
            <NavLink to={user.url + '/pc'} className="navlink" activeClassName="active">My Characters</NavLink>
          </Dropdown>
        ) : (
          <NavLink to="/login" className="navlink" activeClassName="active">Login / Signup</NavLink>
        )}

        { character ? (
          <Dropdown label={character.name} image={character.images[0].path}>
            <NavLink to={character.url} className="navlink" activeClassName="active">Character Sheet</NavLink>
            <NavLink to={character.url + '/inventory'} className="navlink" activeClassName="active">Inventory</NavLink>
            <NavLink to={character.url + '/journal'} className="navlink" activeClassName="active">Journal</NavLink>
            <NavLink to={character.url + '/knowledge'} className="navlink" activeClassName="active">Knowledge</NavLink>
          </Dropdown>
        ) : (
          <Dropdown label="Character">
            <NavLink to="/pc" className="navlink" disabled={!this.props.campaign} activeClassName="active">New Character</NavLink>
            <NavLink to="/pc/new" className="navlink" disabled={!this.props.campaign} activeClassName="active">New Character</NavLink>
          </Dropdown>
        )}

        { campaign ? (
          <Dropdown label="Campaign">
            <NavLink to={campaign.url} className="navlink" activeClassName="active">{campaign.name}</NavLink>
            <NavLink to={campaign.url + '/pc'} className="navlink" activeClassName="active">Characters</NavLink>
            <NavLink to={campaign.url + '/quests'} className="navlink" activeClassName="active">Quests</NavLink>
            <NavLink to={campaign.url + '/calendar'} className="navlink" activeClassName="active">Calendar</NavLink>
            <NavLink to={campaign.url + '/locations'} className="navlink" activeClassName="active">Locations</NavLink>
            <NavLink to={campaign.url + '/lore'} className="navlink" activeClassName="active">Lore</NavLink>
            <NavLink to={campaign.url + '/factions'} className="navlink" activeClassName="active">Factions</NavLink>
          </Dropdown>
        ) : (
          <div></div>
        )}
      </nav>
    )

  }
}
