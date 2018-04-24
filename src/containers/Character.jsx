import React from 'react';
import withResource, { resourceForm } from '../utils/ReloadingView'
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
import { MODIFY_CHARACTER } from '../../graphql/mutations'

export const CharacterForm = resourceForm({
  mutation: MODIFY_CHARACTER,
  alias: 'character',
  variables: ({character, campaign}) => ({
    id: character && character.id,
    campaign: campaign && campaign.id
  }),
  formData: ({character}) => ({
    name: character && character.name,
  }),
  refetchQueries: [{query: CHARACTER, variables: {detail: false}}]
})

class Character extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { loading, character, campaign, error, match, session: {user} } = this.props
    let characters

    character.forEach(character => {
      // compose URL from campaign
      if(campaign) character.url = campaign.url + character.url
    })

    if(character.length > 1) characters = character;
    if(!match.params.character) return <CharacterList characters={character} campaign={campaign}/>
    character = character[0];

    // TODO: 404
    if(!character) return null;


    return (
      <div>
        <HeaderImage images={character.images} alt={character.name} home={match.url}/>
        {/* 
        <h1>{character.name}</h1>
        */}
        <div className="tab-group">
          <NavLink exact to={character.url} className="tab main" activeClassName="active">{character.name}</NavLink>
          <NavLink to={character.url + "/lore"} className="tab" activeClassName="active">About</NavLink>
          <NavLink to={character.url + "/inventory"} className="tab" activeClassName="active">Inventory</NavLink>
          <NavLink to={character.url + "/journal"} className="tab" activeClassName="active">Journal</NavLink>
          <NavLink to={character.url + "/knowledge"} className="tab" activeClassName="active">Knowledge</NavLink>
        </div>

        { /* match.isExact && <CharacterSheet character={character}/> */}

        <Switch>
          <Route exact path={match.path} render={props => <CharacterSheet character={character}/>}/>
          <Route path={match.path + "/inventory/:item?"} render={props => <Items character={character}/>}/>
          <Route path={match.path + "/journal/:slug?"} render={props => <Journal character={character}/>}/>
          <Route path={match.path + "/knowledge"} render={props => <Knowledge character={character}/>}/>
          <Route path={match.path + "/lore"} render={props => <Lore slug={character.id}/>}/>
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
  // subscription: TEST_SUB,
  // subscription: null, // add a subscription query to have the cache be updated automatically
  alias: 'character',
  variables: props => ({
    slug: props.match.params.character,
    user: props.user ? props.user.id : undefined,
    campaign: props.campaign ? props.campaign.id : undefined,
    detail: !!props.match.params.character
  })
})
