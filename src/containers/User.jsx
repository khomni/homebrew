import React from 'react';
import withResource from '../utils/ReloadingView'
import { Route, NavLink, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import Character from './Character';

// import { CharacterSheet, CharacterCard, CharacterList } from '../components/characters';
import HeaderImage from '../components/HeaderImage';
import gql from 'graphql-tag';

import { UserList, UserView } from '../components/user'

/* ============================== 
 * Apollo / GraphQL
 * ============================== */

import { USER } from '../../graphql/queries'

class User extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { match } = this.props;
    let { loading, user, error } = this.props
    let users

    console.log(loading, user)

    if(user.length > 1) <UserList users={user}/>
    user = user[0];

    return <UserView user={user} {...this.props}/>
  }
}

Character.propTypes = {
  client: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  layout: PropTypes.string,
}


export default withResource(User, {
  query: USER,
  // subscription: TEST_SUB,
  // subscription: null, // add a subscription query to have the cache be updated automatically
  alias: 'user',
  variables: props => ({
    slug: props.match.params.username,
    campaign: props.campaign ? props.campaign.id : undefined,
    detail: !!props.match.params.username
  })
})

