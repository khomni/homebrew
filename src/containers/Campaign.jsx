import React from 'react';
import withResource, { resourceForm } from '../utils/ReloadingView'
import { Route, NavLink, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { Redirect } from 'react-router';

import ErrorView from '../components/Error'
import Character from './Character'
import Calendar from './Calendar'

import { CAMPAIGN } from '../../graphql/queries'
import { MODIFY_CAMPAIGN } from '../../graphql/mutations'

import {
  CampaignList,
  CampaignPreview,
  CampaignEdit,
  CampaignView,
} from '../components/campaign';


// use this HOC in component views to modify or create campaigns
export const CampaignForm = resourceForm({
  mutation: MODIFY_CAMPAIGN,
  alias: 'campaign',
  variables: ({campaign}) => ({id: campaign && campaign.id}),
  formData: ({campaign}) => ({
    name: campaign && campaign.name || '', 
    system: campaign && campaign.system && campaign.system.key || '', 
    slug: campaign && campaign.slug || '', 
    privacy_level: campaign && campaign.privacy_level || 'public'
  }),
})

class Campaign extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { campaign, match, err, session: {user} } = this.props;

    if(match.url === '/new-campaign') return <CampaignEdit />

    if(campaign.length > 1) return <CampaignList key={match.url} campaigns={campaign}/>;
    campaign = campaign.pop();

    // TODO: 404 pages
    if(!campaign) return <Redirect to="/new-campaign"/>

    if(match.params.campaign !== campaign.slug) {
      console.log('Campaign url changed in cache:', match, campaign.slug)
      return <Redirect to={campaign.url}/>
    }

    return (
      <Switch>
        <Route path={`${match.path}/edit`} render={props => {
          if(user.id !== campaign.owner.id) return <ErrorView error={new Error('You do not own this campaign')}/>
          return <CampaignEdit {...this.props} campaign={campaign}/>
        }}/>
        <Route exact path={match.path} render={props => <CampaignView {...this.props} campaign={campaign}/>}/>
      </Switch>
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
    // detail is true only if linking directly to a campaign
    detail: !!props.match.params.campaign,
    slug: props.match.params.campaign,
    owner: props.owner && props.owner.id
  })
})

