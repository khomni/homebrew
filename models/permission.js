"use strict";

const { ModelWrapper } = Common.models;

module.exports = ModelWrapper('Permission', DataTypes => ({
  id: false,
  slug: false,
  name: false,
  permissionType: { type: DataTypes.STRING }, // Scope
  permission_id: { type: DataTypes.STRING }, // foreign key
  own: { // typically reserved for the person who created the resource, and grants them full discretion
    type: DataTypes.BOOLEAN,
    default: false,
  },
  read: { // allows the user to view the resource and nested resources
    type: DataTypes.BOOLEAN,
    default: false,
    get() {
      return !this.banned && this.getDataValue('read') || this.owner
    }
  },
  write: { // allows users to modify the resource to some capacity (depends on resource)
    type: DataTypes.BOOLEAN,
    default: false,
    get() {
      return !this.banned && this.getDataValue('write') || this.owner
    }
  },
  banned: {
    type: DataTypes.BOOLEAN,
    default: false
  },
  rights: { // all other arbitrary permissions may be stored here as keyed booleans
    type: DataTypes.JSONB,
  }

}), {
  scopes: {
    defaultScope: {
      attributes: {exclude: ['createdAt','updatedAt']}
    }
  }
}, Permission => {

  Permission.associate = function(models){

    // ensures that permissions can populate relevant users
    Permission.belongsTo(models.User, {
      foreignKey: 'UserId',
      constraints: false,
    })

    Permission.addScope('user', {
      include: [{model: models.User}]
    })
  }
  // Permission.hasOne(models.User, 

  return Permission;
});
