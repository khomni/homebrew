import React from 'react';

const CharacterSheet = ({character, match}) => (
  <div>
    <h2>Character Sheet</h2>
    <pre>{JSON.stringify(character,null,'  ')}</pre>
  </div>
)

export default CharacterSheet
