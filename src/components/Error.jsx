import React from 'react';

const Error = ({error}) => (
  <div>
    <h1>{`${error.status} – ${error.message}`}</h1>
    {error.stack && <pre>{error.stack.join ? error.stack.join('\n') : error.stack}</pre>}
  </div>
)

export default Error
