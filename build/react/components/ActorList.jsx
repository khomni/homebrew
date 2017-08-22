import React from 'react';
import { DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import { ItemTypes } from './Constants';

// Actor List:

const listTarget = {
  drop(props, monitor) {
    let actor = monitor.getItem()
    if(!(props.onDrop && actor.id)) return undefined;
    console.log(actor)
    return props.onDrop(actor)
  },

  hover(props, monitor) {
    console.log(monitor.isOver({shallow:true}))
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  }
}


class ActorList extends React.Component {
  constructor(props) {
    super(props);
    // character: the static character data obtained from the database
    this.state = { }
  }


  render() {
    const {connectDropTarget, isOver} = this.props;
    // convert list object back into array
    return connectDropTarget(
      <div className={"actor-list app-panel grow" + (isOver ? " active" : "")}>
        {this.props.children}
      </div>
    )
  }
}

ActorList.propTypes = {
  isOver: PropTypes.bool.isRequired
}

export default DropTarget(ItemTypes.ACTOR, listTarget, collect)(ActorList)
