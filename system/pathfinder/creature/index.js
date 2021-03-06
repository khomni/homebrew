// Pathfiner Items

// a creature object
// can be instantiated with a complete character record from the db
// the important system-specific details are in args

var Schema = require('js-schema')

function Creature(properties) {
  var thisCreature = this

  // instantiate this creature with all of the system-specific fields only
  // the system object should not care about the system-agnostic fields like name or sex
  Object.assign(thisCreature,properties)

  if(!Creature.schema(thisCreature)) throw new Error('Character does not match schema')
}

var Class = require('./class');
var Item = require('../item');
var Bonus = require('../quant').bonus;

Creature.schema = Schema({
  // '?hp': Number.min(0), // current HP, max HP is determined by class and attributes
  '?experience': Number.min(0),
  '?classes': Array.of(Class.schema),
  '?race': String,
  'bonuses': Array.of(Bonus.schema), // inherent bonuses
  'attributes': Schema({
    str: Number,
    dex: Number,
    'con?': Number,
    'int?': Number,
    wis: Number,
    cha: Number,
  }),
  '?equipment': Schema({ // Numbers here are references to item ids
    '?held': Array.of(0,2,Number), // array of slots to represent each hand (primary, offhand)
    '?head': Number,
    '?headband': Number,
    '?eyes': Number,
    '?shoulders': Number,
    '?neck': Number,
    '?chest': Number,
    '?body': Number,
    '?armor': Number,
    '?belt': Number,
    '?writs': Number, // bracers
    '?hands': Number, // gloves
    '?ring': Array.of(0,2,Number), // array of slots to represent each hand(primary, offhand)
    '?feet': Number,
  })
})

Creature.prototype.addExp = function(int){
  var thisCreature = this
  thisCreature.experience = thisCreature.experience || 0
  thisCreature.experience += int
  return thisCreature
}

// given an Item document, finds the appropriate slot and equips it
Creature.prototype.equip = function(item,options) {
  var thisCreature = this
  var options = options || {}

  if(!item || !item.id || !item.properties) throw new Error("Can't equip that")
  var slot = item.properties.slot || 'held'
  thisCreature.equipment = thisCreature.equipment || {}
  if(['held','ring'].indexOf(slot) >= 0) {

    thisCreature.equipment[slot] = thisCreature.equipment[slot] || []
    if(thisCreature.equipment[slot].reduce((a,b)=>{return a==b||b},false) === true) thisCreature.unequip(slot) // if the held item is two-handed, unequip it

    // if the equipped item is two-handed, ignore hand preference and equip it in two hands
    if(item.properties.hands == 2) {
      thisCreature.equipment[slot] = [item.id, item.id]
      return thisCreature
    }

    if(options.hand == 'offhand') thisCreature.equipment[slot][1] = item.id // off-hand preference
    else if(options.hand == 'primary' || !thisCreature.equipment[slot][0]) thisCreature.equipment[slot][0] = item.id // primary hand preference
    else { // no preference, push it into the primary slot and remove excess items
      thisCreature.equipment[slot].unshift(item.id)
      if(thisCreature.equipment[slot].length > 2) thisCreature.equipment[slot] = thisCreature.equipment[slot].slice(0,2)
    }
    return thisCreature
  }

  this.equipment[slot] = item.id
  return this
}

// removes a reference to an equipment slot
Creature.prototype.unequip = function(slot,options) {
  this.equipment = this.equipment || {}
  var options = options || {}

  // the slot is not an array, or no hand was specified
  if(!Array.isArray(this.equipment[slot]) || !options.hand) {
    delete this.equipment[slot]
    return this
  }

  // the slot is an array and a hand was specified
  if(options.hand == 'primary') delete this.equipment[slot][0]
  if(options.hand == 'offhand') delete this.equipment[slot][1]
  return this

}

module.exports = Creature
