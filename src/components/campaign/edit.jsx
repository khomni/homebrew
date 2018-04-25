import React from 'react'
import { resourceForm } from '../../utils/ReloadingView'
import { MODIFY_CAMPAIGN } from '../../../graphql/mutations'
import { CAMPAIGN } from '../../../graphql/queries'

import { Route, Link, Switch } from 'react-router-dom';
// use this HOC in component views to modify or create campaigns

import GrantPermission from '../../containers/Permission'

export const CampaignForm = resourceForm({
  mutation: MODIFY_CAMPAIGN,
  alias: 'campaign',
  variables: ({campaign}) => ({id: campaign && campaign.id}),
  formData: ({campaign}) => ({
    name: campaign && campaign.name || '', 
    system: campaign && campaign.system && campaign.system.key || '', 
    slug: campaign && campaign.slug || '', 
    privacy_level: campaign && campaign.privacy_level || 0
  }),
  refetchQueries: [{query: CAMPAIGN, variables: {detail: false}}]
})

const CampaignEdit = ({campaign, user}) => (
  <div>
    <CampaignForm campaign={campaign} render ={({setFormData, formData, submit}) => (
      <section>
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

          <div className="flex vert border pad">
            <select
              name="privacy_level"
              type="number"
              placeholder="Privacy Level"
              className="form-input"
              value={formData.privacy_level}
              onChange={setFormData} 
              onKeyDown={submit}>
              <option value={0}>Public</option>
              <option value={1}>Visible</option>
              <option value={2}>Private</option>
              <option value={3}>Hidden</option>
            </select>

            {formData.privacy_level === 0 && (
              <ul>
                <li>Appears in public search results.</li>
                <li>All campaign resources (quests, characters, items, journals, comments, etc) can be viewed without authentication</li>
                <li>Allows users to create and control characters in this universe without approval</li>
                <li>Users can still be banned on an individual basis</li>
              </ul>
            )}

            {formData.privacy_level === 1 && (
              <ul>
                <li>Appears in public search results.</li>
                <li>All campaign resources (quests, characters, items, journals, comments, etc) can be viewed without authentication</li>
                <li>Users need to request permission before adding characters in this campaign</li>
              </ul>
            )}
            {formData.privacy_level === 2 && (
              <ul>
                <li>Appears in public search results.</li>
                <li>Users need to request permission before viewing campaign resources or adding characters in this campaign</li>
              </ul>
            )}
            {formData.privacy_level === 3 && (
              <ul>
                <li>Does not appear in public search results.</li>
                <li>Users can only view resources or add characters if invited by a member with permissions.</li>
              </ul>
            )}
          </div>

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
      </section>
    )}/>
    { campaign && (
      <section>
        <GrantPermission permissable={campaign}/>
      </section>
    ) }
  </div>
)

export default CampaignEdit
