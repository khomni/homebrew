import React from 'react';
import withResource, { resourceForm } from '../utils/ReloadingView'
import { Redirect } from 'react-router';
import { Route, NavLink, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import Items from './Items';
import Journal from './Journal';
import Lore from './Lore';
import Knowledge from './Knowledge';

import { 
  CharacterSheet, 
  CharacterCard, 
  CharacterList,
  CharacterNav,
  CharacterEdit,
} from '../components/characters';
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

    if(match.params.character !== character.slug) return <Redirect to={character.url}/>

    return (
      <div>
        <CharacterNav match={match} character={character}/>
        <HeaderImage images={character.images} alt={character.name} home={match.url}/>
        <Switch>
          <Route exact path={match.path} render={props => <CharacterSheet character={character}/>}/>
          <Route path={character.url + "/edit"} render={props => <CharacterEdit {...this.props} character={character} campaign={campaign}/>}/>
          <Route path={character.url + "/inventory/:item?"} render={props => <Items character={character}/>}/>
          <Route path={character.url + "/inventory/:item?"} render={props => <Items character={character}/>}/>
          <Route path={character.url + "/journal/:slug?"} render={props => <Journal character={character}/>}/>
          <Route path={character.url + "/knowledge"} render={props => <Knowledge character={character}/>}/>
          <Route path={character.url + "/lore"} render={props => <Lore slug={character.id}/>}/>
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
    search: '',
    slug: props.match.params.character,
    user: props.user ? props.user.id : undefined,
    campaign: props.campaign ? props.campaign.id : undefined,
    detail: Boolean(props.match.params.character),
  })
})
