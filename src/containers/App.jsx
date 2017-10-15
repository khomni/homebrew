/* ============================== 
 * React
 * ============================== */

import React from 'react';
import { render } from 'react-dom';
import { PropTypes } from 'prop-types';

import Navbar from '../components/navbar.jsx'

import { withRouter, Route, Link } from 'react-router-dom';

/* ============================== 
 * React-Router Views
 * ============================== */

import Campaign from '../components/views/campaign'
import Character from '../components/views/characters.jsx'
import Home from '../components/views/home'
import User from '../components/views/user'

/* ============================== 
 * Redux
 * ============================== */

import { connect } from 'react-redux';
import { getSession } from '../actions';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { dispatch } = this.props;

    dispatch(getSession());
    // dispatch actions on app start

  }

  render() {
    return (
      <div>
        <Navbar {...this.props}/>
        <div className="app">

          <Route exact path="/" component={Home}/>

          <Route path="/c/" component={Campaign}/>
          <Route path="/pc/" component={Character}/>
          <Route path="/u/" component={User}/>

        </div>
      </div>
    )
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired
}

// hook Redux state into app props
const mapStatetoProps = (state, ownProps) => {
  let {user, character, campaign} = state;

  return {
    session: {
      user,
      character,
      campaign
    }
  }
}

export default withRouter(connect(mapStatetoProps)(App))
