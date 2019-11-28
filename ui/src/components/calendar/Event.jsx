import React from 'react';
import { render } from 'react-dom';

const Event = ({event}) => (
  <div className="event" id={`event-${event.id}`}>
    {event.name}
  </div>
)

export default Event
