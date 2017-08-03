import React from 'react';

import CharOption from './charoption'

// COMBATANT:
// a character that is in initiative; this individual component stores information about their current status
//

export default class Combatant extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    // character: the static character data obtained from the database
    this.state = {
    
    }
  }

  handleClick(e) {
    if(this.props.disabled) return false;
    if(this.props.removeChar) return this.props.removeChar(this.props.character);
  }

  handleMouseDown(e) {
    console.log(e);
  }

  handleMouseUp(e) {
    console.log(e.target, e.clientX, e.clientY);
  }
  
  render() {
    let character = this.props.character
    // convert list object back into array
    return (
      <div className="combatant app-panel grow" draggable={true} key={character.id} onDragStart={this.handleMouseDown} onDragEnd={this.handleMouseUp}>
        <CharOption character={character} >
          <a className="close float right" onClick={this.handleClick}/>
        </CharOption>
        <label>{character.name}</label>
      </div>
    )
  }
}



