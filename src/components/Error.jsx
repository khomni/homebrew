import React from 'react';

const Error = ({error}) => (
  <div>
    <h1>{`${error.status} – ${error.message}`}</h1>
    {error.stack && <pre>{error.stack.join('\n')}</pre>}
  </div>
)

export default Error
