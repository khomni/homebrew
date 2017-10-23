import React from 'react';

import { Link } from 'react-router-dom';

const CharacterCard = ({character}) => (
  <div className="character-card-container">
    <Link to={character.url} className="character-card">
      <div className="character-portrait-container">
        {!!character.Images.length && <img className="character-portrait" src={character.Images[0].path}/>}
      </div>
      <div className="character-stats">
        <div className="name">
          {character.name} 
        </div>
      </div>
    </Link>
  </div>
)

export default CharacterCard


