import React from 'react';

// CHAROPTION:
// a label that contains information about a character and transmits handlers with the character as an argument

export default class CharacterOption extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  handleClick(e) {
    if(this.props.disabled) return false;
    if(this.props.onClick) return this.props.onClick(this.props.character);
  }

  handleDrag(e) {
    if(this.props.onDrag) return this.props.onDrag(this.props.character);
  }
  
  render() {
    // convert list object back into array
    return (
      <label className="character-option" onClick={this.handleClick} onDrag={this.handleDrag} disabled={this.props.disabled}>
        {this.props.children}
      </label>
    )

  }
}


