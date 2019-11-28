import React from 'react';
import { render } from 'react-dom';

import { Redirect, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';

import { resourceForm } from '../utils/ReloadingView'
import { CREATE_SESSION } from '../../graphql/mutations'
import { SESSION } from '../../graphql/queries'

import Home from '../components/views/home'

import { setSession, setJWT, setUser, setCharacter, setCampaign } from '../actions';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Media,
} from 'react-router-dom';

import Character from './Character';
import User, { UserForm } from './User';

export const SessionForm = resourceForm({
  mutation: CREATE_SESSION,
  alias: 'session',
  formData: { alias: '', password: '' },
  onUpdate: ({dispatch}) => (store, { data: { session }}) => {
    dispatch(setSession(session)) // redux store for session
    const data = store.readQuery({ query: SESSION});
    data.session = session;
    store.writeQuery({query: SESSION, data})
  },
});

class Session extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout() {
    const { client } = this.props;

    // creates a blank session
  
  }

  render() {
    const { session: {jwt, user, character, campaign} } = this.props

    // 3. user & character: character/campaign quick-select
    if(user && character) return <Redirect to={character.url}/>
      // 2. user only: show campaign options
    if(user) return <Redirect to={user.url}/>
      // 1. no user in this session: show signup/login page
    return <Home {...this.props}/>
  }
}

const mapStateToProps = ({session}) => ({session})

export default withApollo(withRouter(connect(mapStateToProps)(Session)))

