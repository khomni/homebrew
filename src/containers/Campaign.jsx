import React from 'react';
import withResource, { resourceForm } from '../utils/ReloadingView'
import { Route, NavLink, Switch } from 'react-router-dom';
import { PropTypes } from 'prop-types';

import { Redirect } from 'react-router';

import ErrorView from '../components/Error'
import Character from './Character'
import CharacterForm from '../components/characters/edit';
import Calendar from './Calendar'

import { CAMPAIGN } from '../../graphql/queries'
import { MODIFY_CAMPAIGN } from '../../graphql/mutations'

import {
  CampaignNav,
  CampaignList,
  CampaignPreview,
  CampaignEdit,
  CampaignView,
} from '../components/campaign';

class Campaign extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { 
      campaign, 
      match, 
      session: {user, character},
      updateVariables,
      variables
    } = this.props;


    // apply any session-related transformations on the campaign data
    campaign.forEach(campaign => {
      // campaign.owned = (user && user.id === campaign.owner.id );
      // campaign.active = (character && character.CampaignId === campaign.id );
    })

    console.log(campaign);
    
    if(match.url === '/new-campaign') {
      return <CampaignEdit />
    }

    if(campaign.length !== 1) {
      return <CampaignList 
        key={match.url} 
        campaigns={campaign}
        updateVariables={updateVariables}
        variables={variables}/>;
    }
    campaign = campaign[0];

    // TODO: 404 pages
    if(!campaign) return <Redirect to="/new-campaign"/>

    if(match.params.campaign !== campaign.slug) {
      console.log('Campaign url changed in cache:', match, campaign.slug)
      return <Redirect to={campaign.url}/>
    }

    return (
      <div>
        {/* 
        <h1>{campaign.name}</h1>
        */}
        <CampaignNav match={match} campaign={campaign} />
        <Switch>

          {/* Campaign Routes */}
          <Route exact path={campaign.url} render={props => <CampaignView {...this.props} campaign={campaign}/>}/>
          <Route path={`${campaign.url}/edit`} render={props => <CampaignEdit {...this.props} campaign={campaign}/>}/>

          {/* Character Routes */}
          <Route path={`${campaign.url}/new-character`} render={props => <CharacterForm {...this.props} campaign={campaign}/>}/>
          <Route path={`${campaign.url}/pc/:character?`} render={props => <Character {...this.props} campaign={campaign}/>}/>

          {/* Calendar / Event Routes */}
          <Route path={`${campaign.url}/calendar`} render={props => <Calendar {...this.props} campaign={campaign}/>}/>
          <Route path={`${campaign.url}/e`} render={props => <Calendar {...this.props} campaign={campaign}/>}/>

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
    search: '',
    // detail is true only if linking directly to a campaign
    detail: !!props.match.params.campaign,
    slug: props.match.params.campaign,
    owner: props.owner && props.owner.id
  })
})

