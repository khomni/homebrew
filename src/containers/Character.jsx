import React from 'react';
import withResource from '../utils/ReloadingView'
import { Route, NavLink, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import Items from './Items';
import Journal from './Journal';
import LoreContainer from './Lore';

import { CharacterSheet, CharacterCard, CharacterList } from '../components/characters';
import HeaderImage from '../components/HeaderImage';

/* ============================== 
 * Apollo / GraphQL
 * ============================== */

import { CHARACTER } from '../../graphql/queries'

class Character extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { match } = this.props;
    let { loading, character, error } = this.props
    let characters

    if(character.length > 1) characters = character;
    if(characters) return <CharacterList characters={characters}/>
    character = character[0];

    return (
      <div>
        <HeaderImage images={character.images} alt={character.name} home={match.url}/>
        <div className="tab-group">
          <NavLink to={match.url + "/inventory"} className="tab" activeClassName="active">Inventory</NavLink>
          <NavLink to={match.url + "/journal"} className="tab" activeClassName="active">Journal</NavLink>
          <NavLink to={match.url + "/lore"} className="tab" activeClassName="active">Lore</NavLink>
        </div>
        <h1>{character.name}</h1>

        {match.isExact && <CharacterSheet character={character}/>}

        <Switch>
          <Route path={match.url + "/inventory/:item?"} component={Items}/>
          <Route path={match.url + "/journal"} component={Journal}/>
          <Route path={match.url + "/knowledge"} component={LoreContainer}/>
        </Switch>

      </div>
    )
  }
}

Character.propTypes = {
  client: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  layout: PropTypes.string,
}

export default withResource(Character, {
  query: CHARACTER,
  alias: 'character',
  variables: props => ({
    slug: props.match.params.character,
    detail: !!props.match.params.character
  })
})
