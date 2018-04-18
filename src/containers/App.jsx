/* ============================== 
 * React
 * ============================== */

import React from 'react';
import { render } from 'react-dom';
import { PropTypes } from 'prop-types';


import { Link, Switch, Redirect, Route, withRouter} from 'react-router-dom';

/* ============================== 
 * Components & React-Router Views
 * ============================== */

import Navbar from '../components/navbar.jsx'
import Initiative from './initiative/Initiative.jsx'
import Generators from './generators/Generators.jsx'

import Campaign from './Campaign'
// import Character from '../components/views/characters.jsx'
import Character from './Character.jsx'
import Home from '../components/views/home'
import User from './User.jsx'

/* ============================== 
 * Apollo / GraphQL
 * ============================== */

import { graphql, withApollo } from 'react-apollo';
import { SESSION } from '../../graphql/queries'

/* ============================== 
 * Redux
 * ============================== */

import { connect } from 'react-redux';
import { setUser, setCharacter, setCampaign } from '../actions';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { dispatch } = this.props;
  }

  /*
  componentWillReceiveProps(nextProps) {
    const { dispatch, session } = this.props;
    const { session: nextSession } = nextProps;
  }
  */

  render() {
    const { loading, session } = this.props;
    if(loading) return null;

    // let { user, character, campaign } = this.props;
    return (
      <div>
        <Navbar {...this.props}/>
        <div className="app flex vert">

          <Switch>

            <Route exact path="/" component={Home}/>
            <Route exact path="/login" component={Home}/>
            <Route exact path="/signup" component={Home}/>
            <Route exact path="/s/:system/initiative" component={Initiative}/>
            <Route exact path="/s/:system/generators" component={Generators}/>

            <Route exact path="/c" component={Campaign}/>
            <Route path="/new-campaign" component={Campaign}/>
            <Route path="/c/:campaign/:action?" component={Campaign}/>
            <Route exact path="/pc" component={Character}/>
            <Route path="/pc/:character" component={Character}/>
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

// the top level of the app uses the session query to get the session user's information, including
//      1. the logged in account
//      2. what their current main character is
//      3. what campaign their character is under
//
// the session should be refreshed if the character is changed

const gContainer = graphql(SESSION, {
  props: ({ ownProps: { dispatch }, data: { session, loading, refetch, error } }) => {
    console.log('queried session:', session)
    return ({ loading, refetch, error, session })
  },
})(App)

const mapStateToProps = ({session}) => {
  console.log('state session:', session)
  return { session }
}

export default withRouter(withApollo(connect(mapStateToProps)(gContainer)))
