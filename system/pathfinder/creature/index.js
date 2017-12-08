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
  '?type': [ 'aberration', 'animal', 'construct', 'dragon', 'fey', 'humanoid', 'magical beast', 'monstrous humanoid' ],
  '?subtype': String,
  '?size': [ 'fine', 'diminutive', 'tiny', 'small', 'medium', 'large', 'huge', 'gargantuan', 'colossal' ],
  '?hitDice' : [6, 8, 10, 12],
  '?experience': Number.min(0),
  '?cr': Number.min(0),
  '?alignment': Schema({
    'ethical': ['lawful', 'neutral', 'chaotic'],
    'moral': ['good','neutral','evil']
  }),
  '?classes': Array.of(Class.schema),
  '?ac': Number,
  '?hp': Number,
  '?base_attack': Number,
  // '?race': String,
  '?bonuses': Array.of(Bonus.schema), // inherent bonuses
  '?speed': Schema({
    land: Number,
    swim: Number,
    fly: Number,
    burrow: Number,
    climb: Number
  }),
  '?saving_throw': Schema({
    'fort': Number,
    'ref': Number,
    'will': Number,
  }),
  '?attributes': Schema({
    str: Number,
    dex: Number,
    '?con': Number,
    '?int': Number,
    wis: Number,
    cha: Number,
  }),
  '?equipment': Schema({ // Numbers here are references to item ids
    '?held': Array.of(0,2, Item.schema), // array of slots to represent each hand (primary, offhand)
    '?head': Item.schema,
    '?headband': Item.schema,
    '?eyes': Item.schema,
    '?shoulders': Item.schema,
    '?neck': Item.schema,
    '?chest': Item.schema,
    '?body': Item.schema,
    '?armor': Item.schema,
    '?belt': Item.schema,
    '?writs': Item.schema, // bracers
    '?hands': Item.schema, // gloves
    '?ring': Array.of(0,2, Item.schema), // array of slots to represent each hand(primary, offhand)
    '?feet': Item.schema,
  })
})

Creature.prototype.addExp = function(int){
  var thisCreature = this
  thisCreature.experience = thisCreature.experience || 0
  thisCreature.experience += int
  return thisCreature
}

// given an Item document, finds the appropriate slot and equips it
Creature.prototype.equip = function(item, options = {}) {
  var thisCreature = this

  if(!item || !item.id || !item.properties) throw new Error("Can't equip that")
  var slot = item.properties.slot || 'held'
  thisCreature.equipment = thisCreature.equipment || {}
  if(['held','ring'].indexOf(slot) >= 0) {

    thisCreature.equipment[slot] = thisCreature.equipment[slot] || []
    if(thisCreature.equipment[slot].reduce((a,b) =>  a === b || b, false) === true) thisCreature.unequip(slot) // if the held item is two-handed, unequip it

    // if the equipped item is two-handed, ignore hand preference and equip it in two hands
    if(item.properties.hands === 2) {
      thisCreature.equipment[slot] = [item.id, item.id]
      return thisCreature
    }

    if(options.hand === 'offhand') thisCreature.equipment[slot][1] = item.id // off-hand preference
    else if(options.hand === 'primary' || !thisCreature.equipment[slot][0]) thisCreature.equipment[slot][0] = item.id // primary hand preference
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
Creature.prototype.unequip = function(slot, options = {}) {
  this.equipment = this.equipment || {}

  // the slot is not an array, or no hand was specified
  if(!Array.isArray(this.equipment[slot]) || !options.hand) {
    delete this.equipment[slot]
    return this
  }

  // the slot is an array and a hand was specified
  if(options.hand === 'primary') delete this.equipment[slot][0]
  if(options.hand === 'offhand') delete this.equipment[slot][1]
  return this

}

module.exports = Creature
