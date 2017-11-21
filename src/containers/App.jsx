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

import Campaign from './Campaign'
// import Character from '../components/views/characters.jsx'
import Character from './Character.jsx'
import Home from '../components/views/home'
import User from '../components/views/user'

import { 
  graphql 
} from 'react-apollo';
import { SESSION } from '../../graphql/queries'

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
  }

  render() {
    const { loading, session } = this.props;
    if(loading) return null;
    console.log(this.props.session);

    // let { user, character, campaign } = this.props;
    return (
      <div>
        <Navbar {...this.props}/>
        <div className="app">

          <Switch>
            <Route exact path="/" component={Home}/>
            <Route exact path="/login" component={Home}/>
            <Route exact path="/signup" component={Home}/>
            <Route exact path="/c" component={Campaign}/>
            <Route path="/c/:slug" component={Campaign}/>
            <Route exact path="/pc" component={Character}/>
            <Route path="/pc/:slug" component={Character}/>
            <Route exact path="/u" component={User}/>
            <Route path="/u/:username" component={User}/>
          </Switch>

        </div>
      </div>
    )
  }
}

App.propTypes = {
  dispatch: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
}

const gContainer = graphql(SESSION, {
  props: ({ ownProps, data: { session, loading, refetch, error } }) => ({
    loading, refetch, error, session
  })
})(App)

const mapStateToProps = state => {
  console.log('mapStateToProps:', state);
  return {}
}

export default withRouter(connect(mapStateToProps)(gContainer))
