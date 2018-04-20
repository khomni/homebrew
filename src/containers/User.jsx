import React from 'react';
import withResource, { resourceForm } from '../utils/ReloadingView'
// import { Route, NavLink, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';
import { Link, Switch, Redirect, Route, withRouter} from 'react-router-dom';

/* ==============================
 * Queries
 * ============================== */
import { USER } from '../../graphql/queries'
import { MODIFY_USER } from '../../graphql/mutations'

/* ==============================
 * Containers / Components
 * ============================== */

import Character from './Character';
import { UserList, UserView } from '../components/user'

/* ============================== 
 * Apollo / GraphQL
 * ============================== */

export const UserForm = resourceForm({
  mutation: MODIFY_USER,
  alias: 'user',
  variables: ({user: {id}}) => ({id}),
  formData: ({user}) => ({
    name: user && user.name,
    email: user && user.email,
    password: null,
    password_confirm: null,
  })
})

class User extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { match } = this.props;
    let { loading, user, error } = this.props
    let users


    if(user.length > 1) <UserList users={user}/>
    user = user[0];

    return (
      <div>
        <Switch>
          <Route exact path={`${match.path}/`} render={props => <UserView {...this.props} user={user}/>}/>
          <Route path={`${match.path}/pc`} render={props => <Character {...this.props} user={user}/>}/>
        </Switch>
      </div>
    
    )

    // return <UserView user={user} {...this.props}/>
  }
}

User.propTypes = {
  client: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  layout: PropTypes.string,
}


export default withResource(User, {
  query: USER,
  // subscription: TEST_SUB,
  // subscription: null, // add a subscription query to have the cache be updated automatically
  alias: 'user',
  variables: props => ({
    slug: props.match.params.username,
    campaign: props.campaign ? props.campaign.id : undefined,
    detail: !!props.match.params.username
  })
})

