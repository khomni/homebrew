"use strict";

const icons = require('~/data/icons')

module.exports = function(sequelize, DataTypes) {
  var Item = sequelize.define("Item", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    // current HP of item instance (max is determined by properties and material)
    name : {
      type: DataTypes.STRING,
    },
    hp: {
      type: DataTypes.INTEGER,
      validate : {
        min: 0,
      }
    },
    // value of the object in whichever currency the campaign setting is
    value: {
      type: DataTypes.DECIMAL,
      set(v) {
        this.setDataValue('value', Number(v))
      },
      get(v) {
        return Number(this.getDataValue('value')); 
      },
      validate: {
        min: 0,
      }
    },
    // weight of the object in lbs
    weight: {
      type: DataTypes.DECIMAL,
      set(v) {
        this.setDataValue('weight', Number(v))
      },
      get(v) {
        return Number(this.getDataValue('weight'));
      },
      validate: {
        min: 0,
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
      }
    },
    total_weight: {
      type: DataTypes.VIRTUAL,
      get(){
        return this.weight * this.quantity
      }
    },
    total_value: {
      type: DataTypes.VIRTUAL,
      get(){
        return this.value * this.quantity
      }
    },
    // quality of the item instance where 0 is mundane
    rarity: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    icon: {
      type: DataTypes.STRING,
      validate: function(s) {
        if(s && !icons['rpg-hero'].includes(s)) throw new Error('Not a valid icon')
      }
    },
    // boolean indicating if the item is one-of-a-kind
    unique: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    location: {
      type: DataTypes.GEOGRAPHY
    },
    // an arbitrary JSON object describing the static properties of an item that are inessential for the database (dependent on system)
    // things that may be contained in the properties object:
    //  - Reference to item blueprints or slot in system files
    //  - Caster Level / Aura / School of item
    //  - Miscellaneous properties or bonuses granted by item
    properties: {
      type: DataTypes.JSONB,
    }
  }, {
    classMethods: {
      associate: function(models) {

        // an item may or may not have a location if it is not owned
        // Item.hasOne(models.Location,{
        //   foreignKey: 'locatable_id',
        //   scope: {
        //     locatable: 'Item'
        //   }
        // });

        // an item can have any number of lore items associated with it
        Item.hasMany(models.Lore,{
          as: 'lore',
          foreignKey: 'lorable_id',
          scope: {
            lorable: 'Item'
          },
          constraints: false,
        });

        // Items as Containers
        // TODO: change item ownership to be a polymorphic association so that items can solely belong to other items
        Item.hasMany(models.Item)
      }
    }
  });

  // if an item is saved with 0 quantity, destroy the stack
  Item.hook('beforeSave', (item, options) => {
    if(item.quantity === 0) return item.destroy()
    return Promise.resolve(item)
  })

  // splits an item into multiple stacks by creating a clone with the quantity of the provided number and removing that number from the base
  // returns the base item and the split item stack as an array [base, split]
  Item.Instance.prototype.split = Promise.method(function(number) {
    var thisItem = this
    number = Number(number) || 1

    if(thisItem.quantity <= number) throw Common.error.request("You can't split this item like that")

    var cloneStack = JSON.parse(JSON.stringify(thisItem))
    delete cloneStack.id

    cloneStack = Item.build(cloneStack)
    cloneStack.set('quantity',number)

    return cloneStack.save()
    .then(clone => {
      return thisItem.update({quantity: thisItem.quantity - number})
      .catch(err => {
        // failed to update the item, destroy the clone and throw an error
        return clone.destroy().then(()=>{
          throw err
        })
      })
      .then(updated => {
        return [updated,clone]
      })
    })
  })

  Item.isHierarchy({childrenAs: 'items'});

  return Item;
};
