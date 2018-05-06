import React from 'react';
import { Route, Link, Switch } from 'react-router-dom';

import { CharacterForm } from '../../containers/Character';
import { default as UploadImage } from '../../containers/Image';
import GrantPermission from '../../containers/Permission'

const CharacterEdit = ({character, campaign}) => (
  <div>
    <CharacterForm character={character} campaign={campaign} render={({setFormData, formData, submit}) => (
      <div>
        <section>
          { !character ? (
            <h2>{`New Character in ${campaign.name}`}</h2>
          ) : (
            <h2>{character.name}</h2>
          )}
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
        </section>
      </div>
    )}/>
    { character && (
      <section>
        <pre>{JSON.stringify(character, null, '  ')}</pre>
        <GrantPermission permissable={character}/>
      </section>
    )}
    { character && (
      <section>
        <UploadImage imageable={character}/>
      </section>
    )}
  </div>
)

export default CharacterEdit
