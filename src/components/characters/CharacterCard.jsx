import React from 'react';

import { Link } from 'react-router-dom';

const CharacterCard = ({character}) => (
  <div>
    <Link to={character.url}>
      {character.name} 
    </Link>
  </div>
)

export default CharacterCard


