import React from 'react'
import { resourceForm } from '../../utils/ReloadingView'
import { MODIFY_CAMPAIGN } from '../../../graphql/mutations'

import { Route, Link, Switch } from 'react-router-dom';
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

const CampaignEdit = ({campaign}) => (
  <CampaignForm campaign={campaign} render ={({setFormData, formData, submit}) => (
    <div className="form-group">
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

export default CampaignEdit
