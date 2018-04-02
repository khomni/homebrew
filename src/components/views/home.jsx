import React from 'react';
import { render } from 'react-dom';

import { Redirect, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';

import { resourceForm } from '../../utils/ReloadingView'
import { CREATE_SESSION } from '../../../graphql/mutations'

import { setJWT, setUser, setCharacter, setCampaign } from '../../actions';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Media,
} from 'react-router-dom';

import Character from '../../containers/Character';
/*
<div>
  <input placeholder="Username / Email Address" className="form-input" type="text" name="alias" value={formData.alias} onChange={setFormData}/>
  <input placeholder="Password" className="form-input" type="password" name="password" value={formData.password} onChange={setFormData}/>
  <button className="btn" onClick={submitMutation}>Log In</button>
</div>
*/

const LoginForm = ({render, submitMutation, setFormData, formData}) => (
  <div>
    {render({submitMutation, setFormData, formData})}
  </div>
)

const Login = resourceForm(LoginForm, {
  mutation: CREATE_SESSION,
  alias: 'session',
  formData: { alias: '', password: '' },
  onUpdate: ({dispatch}) => (proxy, { data: { session: { jwt, campaign, user, character }}}) => {
    console.log('new session created:', jwt, user, character, campaign);

    dispatch(setJWT(jwt))
    dispatch(setUser(user))
    dispatch(setCharacter(character))
    dispatch(setCampaign(campaign))
  }
})

const Home = ({match, user, character, campaign, session}) => (
  <div>
    { console.log('Home session:', session) }
    {/* character && <Redirect to={character.url}/> */}
    {/* user && <Redirect to={user.url}/> */}
    <h1>Home</h1>
    { user && <pre>{JSON.stringify(user, null, '  ')}</pre>}
    { character && <pre>{JSON.stringify(character, null, '  ')}</pre>}

    <Login render={({setFormData, formData, submitMutation}) => (
      <div>
        <pre>{JSON.stringify(formData, null, '  ')}</pre>
        <input placeholder="Username / Email Address" className="form-input" type="text" name="alias" value={formData.alias} onChange={setFormData}/>
        <input placeholder="Password" className="form-input" type="password" name="password" value={formData.password} onChange={setFormData}/>
        <button className="btn" onClick={submitMutation}>Log In</button>
      </div>
    )}/>

  </div>
)


const mapStatetoProps = (state, ownProps) => {
  let {user, character, campaign} = state.session;

  return {
    user,
    character,
    campaign
  }
}

export default withApollo(withRouter(connect(mapStatetoProps)(Home)))
