const jwtInterface = require('../../jwt');

module.exports = jwtInterface.getUserFromJWT((root, {permission: permissionInput, permission_id, permissionType}, {user}) => {

  if(!user) throw new Error('You must be loggerd in to grant permissions');

  return db.sequelize.transaction(transaction => {

    return Promise.all([
      db.Permission.find({where: {UserId: user.id, permission_id, permissionType}}),
      db.User.find({where: {id: permissionInput.targetUser}}),
      db[permissionType].find({where: {id: permission_id}})
    ])
    .spread((permission, targetUser, permissable) => {

      /*
      console.log('permissable:', JSON.stringify(permissable))
      console.log('grantee:', JSON.stringify(targetUser))
      console.log('my permissions:', JSON.stringify(permission))
      */

      /* ==============================
       * TODO:
       *  1. Use existing user's permissions to determine which permissions they can share
       *  2. Allow a user to transfer ownership to another user
       *  3. Allow users with ownership permissions to ban users
       * ============================== */

      // the through attributes for the new permission being granted
      let protoPermissions = {}


      if(permission.own) {
        protoPermissions.read = permissionInput.read
        protoPermissions.write = permissionInput.write
        protoPermissions.own = permissionInput.own
        protoPermissions.banned = permissionInput.banned
      } else if(permission.write) {
        // absolute read access
        protoPermissions.read = permissionInput.read
        // affirmative write access
        if(permissionInput.write) protoPermissions.write = permissionInput.write
      } else if(permission.read) {
        // affirmative read access
        if(permissionInput.read) protoPermissions.read = permissionInput.read
      }

      console.log(protoPermissions);

      // add the target user permissions using the granter's permissions
      return permissable.addPermission(targetUser, protoPermissions, {transaction})
      .then(([permissionChanged]) => permissable.getPermission({where: {id: targetUser.id}}))
      .then(([user]) => {
        const { Permission } = user
        console.log('granted permission:', JSON.stringify(Permission, null, '  '))
        // Duplicate
        return Permission
      })


    
    })
  
  })



})
