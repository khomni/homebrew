import React from 'react';

const Error = ({error, hideError}) => (
  <div className="forge-anim error" onClick={() => hideError(error.id)}>
    {error.operation && error.operation.operationName && (
      <h1>
        {error.operation.operationName}
      </h1>
    )}
    {/*<h1>{`${error.status} – ${error.message}`}</h1>*/}
    {error.message && <pre>{error.message}</pre>}
    { /*
      error.stack && <pre>{error.stack.join ? error.stack.join('\n') : error.stack}</pre>
    */}
  </div>
)

export default Error
