import React from 'react';
import { NavLink, Route, Link, Switch } from 'react-router-dom';

const CampaignNav = ({match, campaign}) => (
  <div className="tab-group">
    <NavLink exact to={`${campaign.url}`} className="tab main" activeClassName="active">{campaign.name}</NavLink>
    { campaign.permissions.write && (
      <NavLink to={`${campaign.url}/edit`} className="tab" activeClassName="active">
        <i className="fa fa-wrench"/>
      </NavLink>
    )}
    <NavLink to={`${campaign.url}/pc/`} className="tab" activeClassName="active">Characters</NavLink>
    <NavLink to={`${campaign.url}/calendar/`} className="tab" activeClassName="active">Calendar</NavLink>
    <NavLink to={`${campaign.url}/quests/`} className="tab" activeClassName="active">Quests</NavLink>
    <NavLink to={`${campaign.url}/map/`} className="tab" activeClassName="active">Map</NavLink>
    <NavLink to={`${campaign.url}/factions/`} className="tab" activeClassName="active">Factions</NavLink>
  </div>
)

export default CampaignNav

