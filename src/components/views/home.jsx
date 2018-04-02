import React from 'react';
import { render } from 'react-dom';

import { Redirect, withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withApollo } from 'react-apollo';

import { resourceForm } from '../../utils/ReloadingView'
import { CREATE_SESSION } from '../../../graphql/mutations'
import { SESSION } from '../../../graphql/queries'

import { setSession, setJWT, setUser, setCharacter, setCampaign } from '../../actions';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Media,
} from 'react-router-dom';

import Character from '../../containers/Character';

const LoginForm = ({render, submitMutation, setFormData, formData}) => (
  <div>
    {render({submitMutation, setFormData, formData})}
  </div>
)

const Login = resourceForm(LoginForm, {
  mutation: CREATE_SESSION,
  alias: 'session',
  formData: { alias: '', password: '' },
  onUpdate: ({dispatch}) => (store, { data: { session }}) => {
    dispatch(setSession(session)) // redux store for session
    const data = store.readQuery({ query: SESSION});
    data.session = session;
    store.writeQuery({query: SESSION, data})
  },
  // refetchQueries: [{query: SESSION}]
})

const Home = ({match, session}) => (
  <div>
    { session.character ? (
      <Redirect to={session.character.url}/>
    ) : session.user && (
      <Redirect to={session.user.url}/>
    )}
    <h1>Home</h1>
    { session.user && <pre>{JSON.stringify(session.user, null, '  ')}</pre>}
    { session.character && <pre>{JSON.stringify(session.character, null, '  ')}</pre>}

    <Login render={({setFormData, formData, submitMutation}) => (
      <div>
        <input placeholder="Username / Email Address" className="form-input" type="text" name="alias" value={formData.alias} onChange={setFormData}/>
        <input placeholder="Password" className="form-input" type="password" name="password" value={formData.password} onChange={setFormData}/>
        <button className="btn" onClick={submitMutation}>Log In</button>
      </div>
    )}/>

  </div>
)


const mapStatetoProps = ({session}, ownProps) => {
  return { session }
}

export default withApollo(withRouter(connect(mapStatetoProps)(Home)))
