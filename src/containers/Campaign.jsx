import React from 'react';
import withResource from '../utils/ReloadingView'
import { Route, Link, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import Error from '../components/Error';
import Character from './Character';
import Calendar from './Calendar';

import { CAMPAIGN } from '../../graphql/queries'

class Campaign extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { campaign, match } = this.props;
    let campaigns

    if(campaign.length > 1) {
      <div key={match.url}>
        {campaign.map(c => {
          return <Link key={c.id} to={c.url}>{c.name}</Link>
        })}
      </div>
    }
    campaign = campaign.pop()

    return (
      <div key={match.url}>
        <h1>{campaign.name}</h1>

        <Switch>
          <Route path={match.path + "/pc"} render={props => <Character campaign={campaign}/>}/>
          <Route path={match.path + "/calendar"} render={props => <Calendar campaign={campaign}/>}/>
        </Switch>

      </div>
    )
  }
}

Campaign.propTypes = {
  dispatch: PropTypes.func.isRequired
}

export default withResource(Campaign, {
  query: CAMPAIGN,
  alias: 'campaign',
  variables: props => ({
    slug: props.match.params.campaign
  })
})

