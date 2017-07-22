import React from 'react'

export default class Draggable extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleDrag = this.handleDrag.bind(this);

    this.state = {
      dragging: false
    }
  }

  handleMouseDown(event){
    this.setState({dragging:true});
  }

  handleMouseUp(event) {
    this.setState({dragging:false});
  }

  handleDrag(event){
    console.log(event)
  
  }

  render() {
    return <div className="draggable" 
      onMouseDown={this.handleMouseDown}
      onMouseUp={this.handleMouseUp}>
      onMouseMove={this.state.dragging && this.handleDrag}
      {this.props.children}
    </div>
  }

}

