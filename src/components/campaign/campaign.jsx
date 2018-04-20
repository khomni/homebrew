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
              <Link disabled={true}>Unknown</Link>
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

export const CampaignList = ({campaigns}) => (
  <div>
    <h1>Campaign Directory</h1>
    <hr/>
    <div>
      {campaigns.map(campaign => <CampaignPreview key={campaign.id} campaign={campaign}/>)}
    </div>
    <hr/>
    <Link to='/new-campaign'>Start a New Campaign</Link>
  </div>
)

export const CampaignEdit = ({campaign}) => (
  <CampaignForm campaign={campaign} render ={({setFormData, formData, submit}) => (
    <div className="form-group flex pad border">
      <input 
        name="name" 
        placeholder="Campaign Name"
        className="form-input" 
        required
        value={formData.name} 
        onChange={setFormData} 
        onKeyDown={submit}/>
      <input 
        name="slug"
        placeholder={`Campaign URL`}
        className="form-input"
        value={formData.slug}
        onChange={setFormData}
        onKeyDown={submit}/>
      <select 
        name="system" 
        className="form-input" 
        value={formData.system} 
        onChange={setFormData} 
        onKeyDown={submit}>
        <option>(No System Specified)</option>
        { Object.keys(SYSTEM).map(key => (
          <option key={key} value={key}>{`${SYSTEM[key].name} (${SYSTEM[key].publisher})`}</option>
        ))}
      </select>
      <div className="flex horz pad">
        { campaign && <Link to={campaign.url} className="btn">Cancel</Link>}
        <button className="btn" onClick={submit}>Update</button>
      </div>
    </div>
  )}/>
)

export const CampaignView = ({campaign, match}) => (
  <div>
    <h1>{campaign.name}</h1>
    <pre>
      {JSON.stringify(campaign, null, '  ')}
    </pre>
    <Link to={`${campaign.url}/edit`} className="btn">Edit</Link>
  </div>
)
