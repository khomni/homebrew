import React from 'react'

import CampaignNav from './nav'
import { Route, Link, Switch } from 'react-router-dom';

export default ({campaign, match, session}) => (
  <div>
    <pre>
      {JSON.stringify(campaign, null, '  ')}
    </pre>
    <div className="flex horz pad">
      { campaign.permissions.write &&
        <Link to={`${campaign.url}/edit`} className="btn">Edit</Link>
      }
      <Link to={`${campaign.url}/c/new-character`} className="btn">Make a Character</Link>
    </div>
  </div>
)
