import React from 'react';
import withResource, { resourceForm } from '../utils/ReloadingView'
import { Route, Link, Switch, Redirect } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { Edit, Events } from '../components/calendar';

import { CALENDAR } from '../../graphql/queries'
import { MODIFY_CALENDAR } from '../../graphql/mutations'

const CalendarForm = resourceForm({
  mutation: MODIFY_CALENDAR,
  alias: 'calendar',
  variables: ({campaign}) => ({
    id: campaign && campaign.id,
  }),
  formData: ({campaign, calendar}) => ({
  
  })
})

class Calendar extends React.Component{
  constructor(props) {
    super(props);
  }


  render() {
    let { match, calendar, campaign } = this.props;

    // if(!campaign) return null;
    console.log(match)
    if(!calendar && match.isExact) {
      // edit calendar page if one does not exist
      console.log("Calendar not initialized, redirecting to edit page");
      return <Edit {...this.props} campaign={campaign}/>
    }

    const EditCalendar = (props) => <Edit {...props} campaign={campaign} calendar={calendar}/>
    const ShowMonth = (props) => <Events campaign={campaign} calendar={calendar} years={events}/>

    // TODO: before Campaign is initialized, show a loading effect
    // if(!calendar) return null;

    return (
      <div key={match.url}>
        <h1>Calendar</h1>
        <Link to={`${match.path}/edit`}>Edit</Link>
        <Switch>
          <Route path={match.path} exact render={ShowMonth}/>
          <Route path={`${match.path}/edit`} render={EditCalendar}/>
          <Route path={`${match.path}/:year?/:month?`} component={ShowMonth}/>
          <Route path={`${match.path}/:year?/:month`} component={ShowMonth}/>
          <Route path={`${match.path}/:year?/:month/:day`} component={ShowMonth}/>
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
  variables: ({campaign}) => ({
    campaign: campaign && campaign.id
  })
})
