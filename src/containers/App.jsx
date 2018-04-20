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
import Session from './Session'
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
import { setUser, setCharacter, setCampaign, setSession } from '../actions';

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const { dispatch } = this.props;
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, session } = this.props;
    const { session: nextSession } = nextProps;

    for(let key in nextSession) {
      if(nextSession[key] !== session[key]) {
        console.log("App's inherited session values have changed; dispatching:", nextSession)
        return dispatch(setSession(nextSession));
      }
    }
  }

  render() {
    const { loading, session } = this.props;
    if(loading) return null;
    // let { user, character, campaign } = this.props;
    return (
      <div>
        <Navbar {...this.props}/>
        <div className="app flex vert">

          <Switch>

            <Route exact path="/" component={Session}/>
            <Route exact path="/login" component={Session}/>
            <Route exact path="/signup" component={Session}/>
            <Route exact path="/s/:system/initiative" component={Initiative}/>
            <Route exact path="/s/:system/generators" component={Generators}/>

            <Route exact path="/c" component={Campaign}/>
            <Route path="/new-campaign" component={Campaign}/>
            <Route path="/c/:campaign?/:action?" component={Campaign}/>
            {/*<Route exact path="/characters" component={Character}/>*/}
            <Route path="/pc/:character?" component={Character}/>
            {/*<Route exact path="/users" component={User}/>*/}
            <Route path="/u/:username?" component={User}/>

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

// redux store state will be passed to gContainer props
const mapStateToProps = ({session}, ownProps) => {
  console.log('mstp', session);
  // return ({session})
  return {}
}

import { CREATE_SESSION } from '../../graphql/mutations'

const mapDispatchToProps = (dispatch, {client}) => ({ 
  dispatch,
  logOut() {
    return client.mutate({
      mutation: CREATE_SESSION,
      variables: {destroy: true},
      refetchQueries: [{query: SESSION}]
    })
    .then(({data: {session}}) => {
      console.log('logging out; dispatch session:', session)
      return dispatch(setSession(session));
    })
    .catch(err => {
      console.error('could not log out:', err);
    })
  
  }
})

const gContainer = graphql(SESSION, {
  props: ({ ownProps: { dispatch }, data: { session, loading, refetch, error } }) => {
    let storeSession = {}
    if(session) {
      storeSession.jwt = session.jwt
      storeSession.user = session.user
      storeSession.character = session.character
      storeSession.campaign = session.campaign
    }

    return ({ loading, refetch, error, session: storeSession })
  },
})(App)


export default withRouter(withApollo(connect(mapStateToProps, mapDispatchToProps)(gContainer)))
