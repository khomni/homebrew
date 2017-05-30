"use strict";

const bcrypt = require('bcrypt-nodejs');
Promise.promisifyAll(bcrypt)

module.exports = function(sequelize, DataTypes) {
  var Permission = sequelize.define("Permission", {
    
    permissionType: { type: DataTypes.STRING }, // Scope
    permission_id: { type: DataTypes.INTEGER }, // foreign key

    owner: { // typically reserved for the person who created the resource, and grants them full discretion
      type: DataTypes.BOOLEAN,
      default: false,
    },
    read: { // allows the user to view the resource and nested resources
      type: DataTypes.BOOLEAN,
      default: false,
    },
    write: { // allows users to modify the resource to some capacity (depends on resource)
      type: DataTypes.BOOLEAN,
      default: false,
    },

    rights: { // an array of any other terms that describe the type of permissions the user has
      type: DataTypes.ARRAY(DataTypes.STRING)
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
