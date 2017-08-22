import React from 'react';
import { DragSource } from 'react-dnd';
import PropTypes from 'prop-types';
import { ItemTypes } from '../Constants';

import CharOption from './charoption'

// Actor:
// Any character or creature that can be inserted into initiative
const actorSource = {
  beginDrag(props) {
    return { id: props.actor.id };
  }
}

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class Actor extends React.Component {
  constructor(props) {
    super(props);
    // actor: the static actor data obtained from the database
    this.state = { }
  }

  componentDidMount() {

  }

  render() {
    const { isDragging, connectDragSource, actor } = this.props;
    // convert list object back into array
    return connectDragSource(
      <div className={`grabbable actor app-panel ${isDragging ? 'active' : ''}`}>
        {this.props.children}
      </div>
    )
  }
}

Actor.propTypes = {
  actor: PropTypes.object.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
}

export default DragSource(ItemTypes.ACTOR, actorSource, collect)(Actor)

