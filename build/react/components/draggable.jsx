import React from 'react'
import { findDOMNode } from 'react-dom';

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

  componentDidMount(){
    let offsetParent = findDOMNode(this).offsetParent
    console.log(offsetParent.getBoundingClientRect());
  }

  handleMouseDown(event){
    this.setState({dragging:true});
  }

  handleMouseUp(event) {
    this.setState({dragging:false});
  }

  handleDrag(event){
    // TODO: 
    // 1. constrain element to its offsetParent
    // 2. set the x and y relative to the part of the draggable object clicked
    this.setState({x:event.screenX, y: event.screenY})

  }

  render() {
    let thisStyle
    if('x' in this.state && 'y' in this.state) {
      thisStyle = {top: this.state.y, left: this.state.x}
    }

    return <div className="draggable" 
      style={thisStyle}
      onMouseDown={this.handleMouseDown}
      onMouseUp={this.handleMouseUp}
      onMouseMove={this.state.dragging && this.handleDrag}>
        {this.props.children}
    </div>
  }

}

