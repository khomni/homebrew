import React from 'react';
import withResource, { resourceForm } from '../utils/ReloadingView'
import { PropTypes } from 'prop-types';

import { Redirect } from 'react-router';

import Error from '../components/Error'
import Character from './Character'
import Calendar from './Calendar'

import { CAMPAIGN } from '../../graphql/queries'
import { MODIFY_CAMPAIGN } from '../../graphql/mutations'

import {
  CampaignList,
  CampaignPreview,
  CampaignView,
} from '../components/campaign';


// use this HOC in component views to modify or create campaigns
export const CampaignForm = resourceForm({
  mutation: MODIFY_CAMPAIGN,
  alias: 'campaign',
  formData: ({campaign: {id, name, slug, system, privacy_level}}) => ({
    id,
    name, 
    system: system.key, 
    url: slug, 
    privacy_level
  }),
})

class Campaign extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { campaign, match, err } = this.props;

    if(campaign.length > 1) return <CampaignList key={match.url} campaigns={campaign}/>;
    campaign = campaign.pop();

    // TODO: 404 pages
    if(!campaign) return <Redirect to="/c/"/>

    if(match.params.campaign !== campaign.slug) {
      console.log('Campaign url changed in cache:', match, campaign.url)
      return <Redirect to={campaign.url}/>
    }

    return <CampaignView key={match.url} {...this.props} campaign={campaign}/>
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
  })
})

