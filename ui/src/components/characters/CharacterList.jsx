import React from 'react';
import { Route, Link, Switch } from 'react-router-dom';

import CharacterCard from './CharacterCard';

const CharacterList = ({characters, campaign}) => (
  <div>
    <h2>Characters</h2>
    {characters.map(character => <CharacterCard key={character.id} character={character}/>)}
    { campaign && <Link to={`${campaign.url}/new-character`}>New Character</Link>}
  </div>
)

export default CharacterList

