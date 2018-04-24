"use strict";

const bcrypt = require('bcrypt-nodejs');
Promise.promisifyAll(bcrypt)

module.exports = function(sequelize, DataTypes) {
  var Permission = sequelize.define("Permission", {
    
    permissionType: { type: DataTypes.STRING }, // Scope
    permission_id: { type: DataTypes.INTEGER }, // foreign key

    own: { // typically reserved for the person who created the resource, and grants them full discretion
      type: DataTypes.BOOLEAN,
      default: false,
    },
    read: { // allows the user to view the resource and nested resources
      type: DataTypes.BOOLEAN,
      default: false,
      get() {
        return this.getDataValue('write') || this.owner
      }
    },
    write: { // allows users to modify the resource to some capacity (depends on resource)
      type: DataTypes.BOOLEAN,
      default: false,
      get() {
        return this.getDataValue('write') || this.owner
      }
    },

    rights: { // all other arbitrary permissions may be stored here as keyed booleans
      type: DataTypes.JSONB,
    }

  }, {
    scopes: {
      defaultScope: {
        attributes: {exclude: ['createdAt','updatedAt']}
      }
    }
  });

  return Permission;
};
