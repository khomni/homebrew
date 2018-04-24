import React from 'react';
import { Route, Link, Switch } from 'react-router-dom';

import { CharacterForm } from '../../containers/Character';

const CharacterEdit = ({character, campaign}) => (
  <CharacterForm character={character} campaign={campaign} render={({setFormData, formData, submit}) => (
    <div>
      <h2>{`New Character in ${campaign.name}`}</h2>
      <div className="form-group">
        <input
          name="name"
          placeholder={character && character.name || "Name"}
          className="form-input"
          required
          value={formData.name}
          onChange={setFormData}
          onKeyDown={submit}
          />
      </div>
    </div>
  )}/>
)

export default CharacterEdit
