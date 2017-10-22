import React from 'react';
import ReloadingView from '../utils/ReloadingView'
import { withRouter, Route, Link, Switch, Redirect } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { getResource } from '../actions';

import { 
  Edit as EditCalendar,
  Month
} from '../components/calendar';

import Error from '../components/Error';

class Calendar extends ReloadingView {
  constructor(props) {
    super(props);
    this.onFetch = this.onFetch.bind(this);

    this.state = { calendar: this.props.calendar }
  }

  onFetch(data) {
    this.setState({calendar:data});
  }

    /*
  onError(error) {
    let { match, history } = this.props

    return this.setState({error})
  }
  */

  render() {
    let { match } = this.props;
    let { error, calendar} = this.state

    if(!calendar && match.isExact) {
      console.log("Calendar not initialized, redirecting to edit page");
      return <Redirect to={match.url + "/edit"}/>
    }
    if(error) return <Error error={error}/>
    
    // TODO: before Campaign is initialized, show a loading effect
      // if(!calendar) return null;

    return (
      <div key={match.url}>
        <h1>Calendar</h1>
        <Switch>
          <Route patch={match.url + "/edit"} component={EditCalendar}/>
          <Route patch={match.url + "/:year?/:month?"} component={EditCalendar}/>
          <Route patch={match.url + "/:year/:month"} component={EditCalendar}/>
          <Route patch={match.url + "/:year/:month/:day"} component={EditCalendar}/>
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


