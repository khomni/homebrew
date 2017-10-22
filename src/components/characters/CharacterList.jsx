import React from 'react';

import CharacterCard from './CharacterCard';

const CharacterList = ({characters}) => (
  <div>
    <h2>Characters</h2>
    {characters.map(c => <CharacterCard key={c.id} character={c}/>)}
  </div>
)

export default CharacterList

