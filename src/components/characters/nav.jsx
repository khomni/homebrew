import React from 'react';
import { NavLink, Route, Link, Switch } from 'react-router-dom';

const CharacterNav = ({match, character}) => (
  <div className="tab-group">
    <NavLink exact to={character.url} className="tab main" activeClassName="active">{character.name}</NavLink>
    { character.permissions.write && (
      <NavLink to={`${character.url}/edit`} className="tab" activeClassName="active">
        <i className="fa fa-wrench"/>
      </NavLink>
    )}
    <NavLink to={character.url + "/lore"} className="tab" activeClassName="active">About</NavLink>
    <NavLink to={character.url + "/inventory"} className="tab" activeClassName="active">Inventory</NavLink>
    <NavLink to={character.url + "/journal"} className="tab" activeClassName="active">Journal</NavLink>
    <NavLink to={character.url + "/knowledge"} className="tab" activeClassName="active">Knowledge</NavLink>
  </div>
)

export default CharacterNav
