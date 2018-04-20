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
    const { session, dispatch, logOut } = this.props;
    const { user, character, campaign } = session

    return (
      <nav className="navigation">
        { user ? (
          <Dropdown label={user && user.name || "?"} >
            <NavLink to={user.url} className="navlink" activeClassName="active"> Account </NavLink>
            <NavLink to="/messages" className="navlink" activeClassName="active">Inbox</NavLink>
            <NavLink to="/" className="navlink" onClick={logOut}>Log Out</NavLink>
          </Dropdown>
        ) : (
          <NavLink to="/login" className="navlink" activeClassName="active">Login / Signup</NavLink>
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
            <hr className="dropdown-separator"/>
            <NavLink to={user.url + '/c'} className="navlink" activeClassName="active">My Campaigns</NavLink>
          </Dropdown>
        ) : (
          <Dropdown label='Campaign'>
            <NavLink to='/new-campaign' className="navlink" activeClassName="active">Start a Campaign</NavLink>
            <NavLink to='/c/'className="navlink" activeClassName="active">Browse Campaigns</NavLink>
            <hr className='dropdown-separator'/>
            { user && <NavLink to={user.url + '/c/'} className="navlink" activeClassName="active">My Campaigns</NavLink> }
          </Dropdown>
        )}

        { character ? (
          <Dropdown label={character.name} image={character.images[0].path}>
            <NavLink to={character.url} className="navlink" activeClassName="active">Character Sheet</NavLink>
            <NavLink to={character.url + '/inventory'} className="navlink" activeClassName="active">Inventory</NavLink>
            <NavLink to={character.url + '/journal'} className="navlink" activeClassName="active">Journal</NavLink>
            <NavLink to={character.url + '/knowledge'} className="navlink" activeClassName="active">Knowledge</NavLink>
            <hr className="dropdown-separator"/>
            <NavLink to={user.url + '/pc'} className="navlink" activeClassName="active">My Characters</NavLink>
          </Dropdown>
        ) : (
          <Dropdown label="Character" disabled={!campaign}>
            <NavLink to="/pc" className="navlink" disabled={!campaign} activeClassName="active">New Character</NavLink>
            <hr className="dropdown-separator"/>
            { user && <NavLink to={user.url + '/pc'} className="navlink" activeClassName="active">My Characters</NavLink>}
          </Dropdown>
        )}
      </nav>
    )

  }
}
