import React from 'react';

const Error = ({error, hideError}) => (
  <div className="forge-anim error" onClick={() => hideError && hideError(error.id)}>
    {error.operation && error.operation.operationName && (
      <h3>
        {error.operation.operationName}
      </h3>
    )}
    {error.message && <pre>{error.message}</pre>}
  </div>
)

export default Error
