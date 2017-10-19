/* ============================== 
 * React
 * ============================== */

import React from 'react';
import { render } from 'react-dom';
import { PropTypes } from 'prop-types';

import Navbar from '../components/navbar.jsx'

import { Link, Switch, Redirect, Route, withRouter} from 'react-router-dom';

/* ============================== 
 * React-Router Views
 * ============================== */

import Campaign from '../components/views/campaign'
// import Character from '../components/views/characters.jsx'
import Character from './Character.jsx'
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
    let { user, character, campaign } = this.props.session;
    return (
      <div>
        <Navbar {...this.props}/>
        <div className="app">

          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/c/" component={Campaign}/>
            <Route exact path="/pc" component={Character}/>
            <Route path="/pc/:slug" component={Character}/>
            <Route exact path="/u/" component={User}/>
            <Route path="/u/:username" component={User}/>
          </Switch>

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
  let {user, character, campaign} = state.session;

  return {
    session: {
      user,
      character,
      campaign
    }
  }
}

export default withRouter(connect(mapStatetoProps)(App))
