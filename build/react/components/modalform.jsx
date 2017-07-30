import React from 'react';
import Draggable from './draggable'; 

export default class ModalForm extends React.Component {
  constructor(props){
    super(props);

    this.state = {
    
    }
  }

  render() {
    return (
      <Draggable>
        <div className="modal">
          <form action={this.props.action} method={this.props.method}>
            {this.props.children}
          </form>
        </div>
      </Draggable>
    )
  }

}
