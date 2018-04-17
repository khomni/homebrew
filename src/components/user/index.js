import React from 'react';

export const UserList = ({ user }) => (
  <div>
  </div>
)

export const UserView = ({ user }) => (
  <pre>
    {JSON.stringify(user, null, '  ')}
  </pre>
)

export default UserView
