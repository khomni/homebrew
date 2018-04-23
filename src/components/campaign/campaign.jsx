import React from 'react'
import { Route, Link, Switch } from 'react-router-dom';

import { CampaignForm } from '../../containers/Campaign';
import Character from '../../containers/Character';
import Calendar from '../../containers/Calendar';

export const CampaignPreview = ({campaign}) => (
  <section>
    <h3>{campaign.name}</h3>
    <table>
      <tbody>
        <tr>
          <th>Owned By:</th>
          <td>
            { campaign.owner ? (
              <Link to={campaign.owner.url}>{campaign.owner.name}</Link>
            ) : (
              <Link disabled={true}>Unknown</Link>
            ) }
          </td>
        </tr>
        <tr>
          <th>System:</th>
          <td>
            { campaign.system ? (
              <Link to={`/s/${campaign.system.key}`}>{campaign.system.name}</Link>
            ) : (
              <a disabled={true}>Unknown</a>
            ) }
          </td>
        </tr>
        <tr>
          <th>Privacy:</th>
          <td>{campaign.privacy_level}</td>
        </tr>
        <tr>
          <th>Users:</th>
          <td>{campaign.total_users}</td>
        </tr>
        <tr>
          <th>Characters:</th>
          <td>{campaign.total_characters}</td>
        </tr>
      </tbody>
    </table>
    <Link to={campaign.url}>Go to Campaign Page</Link>
  </section>
)

export const CampaignList = ({campaigns, updateVariables, variables}) => (
  <div>
    <h1>Campaign Directory</h1>
    <div className="flex horz pad">
      <input 
        name="search"
        value={variables.search}
        placeholder="search"
        className="form-input" 
        onChange={updateVariables} 
        onKeyDown={updateVariables}/>
      <button type="submit" onClick={updateVariables} className="btn">Search</button>
    </div>
    <hr/>
    <div>
      {campaigns.map(campaign => <CampaignPreview key={campaign.id} campaign={campaign}/>)}
    </div>
    <hr/>
    <Link to='/new-campaign'>Start a New Campaign</Link>
  </div>
)


