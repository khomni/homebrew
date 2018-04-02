import React from 'react';
import withResource from '../utils/ReloadingView'
import { Route, NavLink, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import Items from './Items';
import Journal from './Journal';
import Lore from './Lore';
import Knowledge from './Knowledge';

import { CharacterSheet, CharacterCard, CharacterList } from '../components/characters';
import HeaderImage from '../components/HeaderImage';
import gql from 'graphql-tag';

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
          <NavLink to={match.url + "/lore"} className="tab" activeClassName="active">About</NavLink>
          <NavLink to={match.url + "/inventory"} className="tab" activeClassName="active">Inventory</NavLink>
          <NavLink to={match.url + "/journal"} className="tab" activeClassName="active">Journal</NavLink>
          <NavLink to={match.url + "/knowledge"} className="tab" activeClassName="active">Knowledge</NavLink>
        </div>
        <h1>{character.name}</h1>

        {match.isExact && <CharacterSheet character={character}/>}

        <Switch>
          <Route path={match.path + "/inventory/:item?"} render={props => <Items character={character}/>}/>
          <Route path={match.path + "/journal/:slug?"} render={props => <Journal character={character}/>}/>
          <Route path={match.path + "/knowledge"} render={props => <Knowledge character={character}/>}/>
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

const TEST_SUB = gql`
subscription test {
  test {
    name
    id
  }
}
`

export default withResource(Character, {
  query: CHARACTER,
  // subscription: TEST_SUB,
  // subscription: null, // add a subscription query to have the cache be updated automatically
  alias: 'character',
  variables: props => ({
    slug: props.match.params.character,
    campaign: props.campaign ? props.campaign.id : undefined,
    detail: !!props.match.params.character
  })
})
