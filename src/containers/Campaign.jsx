import React from 'react';
import ReloadingView from '../utils/ReloadingView'
import { withRouter, Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { connect } from 'react-redux';
import { getResource } from '../actions';

import Error from '../components/Error';
import Character from './Character';
import Calendar from './Calendar';

class Campaign extends ReloadingView {
  constructor(props) {
    super(props);
    this.onFetch = this.onFetch.bind(this);

    this.state = { campaign: this.props.campaign }
  }

  onFetch(campaign) {
    this.setState({campaign});
  }

  render() {
    let { match } = this.props;
    let { error, campaign} = this.state

    if(error) return (
      <Error error={error}/>
    )

    // TODO: before Campaign is initialized, show a loading effect
    if(!campaign) return null;

    // TODO: use the Campaign container to handle both Campaigns and lists of Campaigns
    // TODO: more support for Campaign routes with options based on context
    if(Array.isArray(campaign)) return (
      <div key={match.url}>
        {campaign.map(c => {
          return <Link key={c.id} to={c.url}>{c.name}</Link>
        })}
      </div>
    )

    return (
      <div key={match.url}>
        <h1>{campaign.name}</h1>
        <label>{`As of ${this.lastFetch.toLocaleString()}`}</label>

        <Switch>
          <Route path={match.url + "/pc"} component={Character}/>
          <Route path={match.url + "/calendar"} component={Calendar}/>
        </Switch>

      </div>
    )
  }
}

Campaign.propTypes = {
  dispatch: PropTypes.func.isRequired
}

const mapStatetoProps = (state, ownProps) => {
  return {}
}

export default withRouter(connect(mapStatetoProps)(Campaign))

