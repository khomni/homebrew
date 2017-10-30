import React from 'react';
import ReloadingView from '../utils/ReloadingView'
import { withRouter, Route, Link, Switch, Redirect } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { getResource } from '../actions';

import { 
  Edit, 
  Events
} from '../components/calendar';

import Error from '../components/Error';

class MonthContainer extends ReloadingView {
  onFetch({events}) {
    this.setState({events})
  }
  render() {
    const { calendar } = this.props
    const { initialized, events } = this.state
    if(!initialized) return null;
    return (
      <Events calendar={calendar} years={events}/>
    )
  }
}

class Calendar extends ReloadingView {
  constructor(props) {
    super(props);
    this.onFetch = this.onFetch.bind(this);

    this.state = { calendar: this.props.calendar }
  }

  onFetch({calendar, events}) {
    this.setState({calendar});
  }

  render() {
    let { match } = this.props;
    let { error, calendar, initialized } = this.state

    if(!initialized) return null;

    if(!calendar && match.isExact) {
      console.log("Calendar not initialized, redirecting to edit page");
      return <Redirect to={match.url + "/edit"}/>
    }
    if(error) return <Error error={error}/>

      // if(calendar && match.isExact) return <Redirect to={match.url + "/present"}/>

    let EditCalendar = (props) => <Edit calendar={calendar} {...props} />
    let ShowMonth = (props) => <MonthContainer calendar={calendar} {...props}/>
    // TODO: before Campaign is initialized, show a loading effect
    // if(!calendar) return null;

    return (
      <div key={match.url}>
        <h1>Calendar</h1>
        <Link to={match.url + "/edit"}>Edit</Link>
        <Switch>
          <Route path={match.url} exact render={ShowMonth}/>
          <Route path={match.url + "/edit"} render={EditCalendar}/>
          <Route path={match.url + "/:year?/:month?"} component={ShowMonth}/>
          <Route path={match.url + "/:year/:month"} component={ShowMonth}/>
          <Route path={match.url + "/:year/:month/:day"} component={ShowMonth}/>
        </Switch>

      </div>
    )
  }
}

Calendar.propTypes = {
  dispatch: PropTypes.func.isRequired
}

const mapStatetoProps = (state, ownProps) => {
  return {}
}

export default withRouter(connect(mapStatetoProps)(Calendar))


