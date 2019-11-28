import React from 'react';
import { render } from 'react-dom';

import withResource, { resourceForm } from '../utils/ReloadingView'
import { Redirect, withRouter } from 'react-router';

import { USER_PERMISSIONS } from '../../graphql/queries'
import { GRANT_PERMISSION } from '../../graphql/mutations'

export const GrantPermissionForm = resourceForm({
  mutation: GRANT_PERMISSION,
  alias: 'permission',
  formData: ({permissions}) => ({
    read: permissions.read,
    write: permissions.write,
    own: false,
    banned: false,
  }),
  variables: ({permissable}) => ({
    permission_id: permissable && permissable.id,
    permissionType: permissable && permissable.__typename
  })
})

class Permission extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      nodePermission,
      user, // a list of users the current user can grant permissions to
      permissable, // the thing permissions are being granted for
      updateVariables, 
      variables,
      session: {user: me}
    } = this.props;

    const { permissions } = permissable

    return (
      <div>
        <h3>Permissions</h3>
        <GrantPermissionForm permissable={permissable} permissions={permissions} render={({setFormData, formData, submit}) => (
          <div>
            <div className="flex" >
              <div className="grow">
                <label>Grantee</label>
                <input
                  name="search"
                  className="form-input"
                  placeholder="Search for Users"
                  value={variables.search}
                  onChange={updateVariables}
                  onKeyDown={updateVariables}/>
                {nodePermission && nodePermission.map(({user, permissions}) => (
                  <label key={user.id} className="radio" disabled={user.id === me.id} >
                    <input 
                      type="radio"
                      name="targetUser"
                      value={user.id}
                      disabled={user.id === me.id}
                      checked={formData.targetUser === user.id}
                      onChange={event => {
                        let {read, write, own, banned} = permissions
                        setFormData({data: {targetUser: user.id, read, write, own, banned}});
                      }}/>
                    <span>{user.name}</span>
                  </label>
                ))}
              </div>

              <div className="flex vert border pad grow">
                <label>Permissions</label>

                <label className="checkbox">
                  <input 
                    name="read"
                    checked={formData.read}
                    onChange={setFormData}
                    type="checkbox"/>
                  <span>Read Permissions</span>
                </label>

                <label className="checkbox">
                  <input 
                    name="write"
                    checked={formData.write}
                    onChange={setFormData}
                    type="checkbox"/>
                  <span>Write Permissions</span>
                </label>

                <label className="checkbox">
                  <input 
                    name="own"
                    checked={formData.own}
                    onChange={setFormData}
                    type="checkbox"/>
                  <span>Owner</span>
                </label>

                <label className="checkbox">
                  <input 
                    name="banned"
                    checked={formData.banned}
                    onChange={setFormData}
                    type="checkbox"/>
                  <span>Banned</span>
                </label>
              </div>
            </div>
            <button className="btn" onClick={submit}>Grant Permissions</button>
          </div>
        )}/>
      </div>
    )
  }
}

export default withResource(Permission, {
  query: USER_PERMISSIONS,
  alias: 'nodePermission',
  variables: ({permissable}) => ({
    permission_id: permissable.id,
    permissionType: permissable.__typename,
    search: ''
  })
})
