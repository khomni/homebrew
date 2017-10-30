import React from 'react';
import { render } from 'react-dom';

import { Redirect, withRouter } from 'react-router';
import { connect } from 'react-redux';
import Form from '../../utils/form.jsx'

import {
  BrowserRouter as Router,
  Route,
  Link,
  Media,
} from 'react-router-dom';

import Character from '../../containers/Character';

const Home = ({match, user, character, campaign}) => (
  <div>
    { character && <Redirect to={character.url}/> }
    { user && <Redirect to={user.url}/> }
    <h1>Home</h1>

    <Form action="/login" method="post">
      <input placeholder="Username / Email Address" className="form-input" type="text" name="user"/>
      <input placeholder="Password" className="form-input" type="password" name="password"/>
      <button className="btn" type="submit">Log In</button>
    </Form>

    <Form action="/login" method="post">
      <input className="form-input" type="email" name="email"/>
      <input className="form-input" type="password" name="password"/>
      <button className="btn" type="submit">Log In</button>
    </Form>

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

export default withRouter(connect(mapStatetoProps)(Home))
