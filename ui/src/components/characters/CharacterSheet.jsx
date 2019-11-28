import React from 'react';

const CharacterSheet = ({character, match}) => (
  <div>
    <pre>{JSON.stringify(character,null,'  ')}</pre>
  </div>
)

export default CharacterSheet
