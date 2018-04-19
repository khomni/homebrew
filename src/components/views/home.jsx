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
import User, { UserForm } from '../../containers/User';

const Login = resourceForm({
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
});

export default ({match, session}) => (
  <div>
    <h1>Home</h1>
    { session.user && <pre>{JSON.stringify(session.user, null, '  ')}</pre>}
    { session.character && <pre>{JSON.stringify(session.character, null, '  ')}</pre>}

    <Login render={({setFormData, formData, submit}) => (
      <div>
        <input placeholder="Username / Email Address" className="form-input" type="text" name="alias" value={formData.alias} onChange={setFormData}/>
        <input placeholder="Password" className="form-input" type="password" name="password" value={formData.password} onChange={setFormData}/>
        <button className="btn" onClick={submit}>Log In</button>
      </div>
    )}/>

    <UserForm render={({setFormData, formData, submit}) => (
      <div>
        <input 
          name="name" 
          placeholder="Username" 
          className="form-input" 
          type="text" 
          value={formData.name} 
          onChange={setFormData} />
        <input 
          name="email" 
          placeholder="Email" 
          className="form-input" 
          type="email" 
          value={formData.email} 
          onChange={setFormData} />
        <input 
          name="password" 
          placeholder="Password" 
          className="form-input" 
          type="password" 
          value={formData.password} 
          onChange={setFormData}/>
        <input 
          name="password_confirm" 
          placeholder="Password (Confirm)" 
          className="form-input" 
          type="password" 
          value={formData.password_confirm} 
          onChange={setFormData}/>
        <button className="btn" onClick={submit}>Create Account</button>
      </div>
    )}/>

  </div>
)
