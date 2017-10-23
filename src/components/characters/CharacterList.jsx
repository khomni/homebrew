import React from 'react';

import CharacterCard from './CharacterCard';

class CharacterList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    let { characters } = this.props;


    return (
      <div>
        <h2>Characters</h2>
        {characters.map(c => <CharacterCard key={c.id} character={c}/>)}
      </div>
    )
  }

}

export default CharacterList

