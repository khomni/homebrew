import React from 'react';
import withResource from '../utils/ReloadingView'
import { Route, Link, Switch, Redirect } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { Edit, Events } from '../components/calendar';

import { CALENDAR } from '../../graphql/queries'

class Calendar extends React.Component{
  constructor(props) {
    super(props);
  }


  render() {
    let { match, calendar } = this.props;

    if(!calendar && match.isExact) {
      console.log("Calendar not initialized, redirecting to edit page");
      return <Redirect to={match.url + "/edit"}/>
    }

    let EditCalendar = (props) => <Edit calendar={calendar} {...props} />
    let ShowMonth = (props) => <Events calendar={calendar} years={events}/>
    // TODO: before Campaign is initialized, show a loading effect
    // if(!calendar) return null;

    return (
      <div key={match.url}>
        <h1>Calendar</h1>
        <Link to={match.path + "/edit"}>Edit</Link>
        <Switch>
          <Route path={match.path} exact render={ShowMonth}/>
          <Route path={match.path + "/edit"} render={EditCalendar}/>
          <Route path={match.path + "/:year?/:month?"} component={ShowMonth}/>
          <Route path={match.path + "/:year/:month"} component={ShowMonth}/>
          <Route path={match.path + "/:year/:month/:day"} component={ShowMonth}/>
        </Switch>
      </div>
    )
  }
}

Calendar.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default withResource(Calendar, {
  query: CALENDAR,
  alias: 'calendar',
  variables: props => ({
    campaign: props.campaign.id
  })
})
