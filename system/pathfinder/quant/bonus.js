var Schema = require('js-schema');

function Bonus(args) {
  var thisBonus = this
  Object.assign(thisBonus,args)
  if(!Bonus.schema(thisBonus)) throw new Error('Quantifiable does not match schema')
}

module.exports.types = [
  'alchemical',
  'armor',
  'circumstance',
  'competence',
  'deflection',
  'dodge',
  'enhancement',
  'inherent',
  'insight',
  'luck',
  'morale',
  'natural armor',
  'profane',
  'racial',
  'resistance',
  'sacred',
  'shield',
  'size',
  'trait'
]

var Quantifiable = require('./')

// given an array of bonuses, gathers and returns an object representing the accumulated bonuses
Bonus.gatherBonuses = function(bonusArray) {
  var bonuses = {}
  bonusArray.map(bonus =>{
    if(!Bonus.schema(bonus)) return null // only work on valid bonuses
    var key = bonus.key // string representation of the quantifiable
    var quantifiable = Quantifiable.list.get(key)
    if(!Quantifiable.schema(quantifiable)) return null // only work with valid quantifiables

    bonuses[key] = bonuses[key] || {} // key the bonus by the flattened key
    if(!bonus.type) bonus.type = 'inherent'
    bonuses[key][bonus.type] = bonuses[key][bonus.type] || 0

    if(['inherent','dodge'].indexOf(bonus.type)) { // stackable
      bonuses[key][bonus.type] += bonus.bonus
    } else { // not stackable
      bonuses[key][bonus.type] = Math.max(bonuses[key][bonus.type], bonus.bonus) // if there is already that bonus present, pick the higher one
    }

    bonuses[key].label = bonuses[key].label || quantifiable.label // set the display label for the bonus
  })
  return bonuses
}

Bonus.schema = Schema({
  key: Quantifiable.list.keys, // the list of all keys for quantifiable metrics
  bonus: [Number, Array.of(2, Number.min(1).step(1))], // bonus can be a number or an array of positive whole numbers if referring to dice
  '?percentage': Boolean, // if present and true, the bonus is a percentage effect
  '?round': ['up','down'], // if present, indicate whether to round up or down
  // per pathfinder rules, bonuses have a type that does not typically stack with itself
  '?type': module.exports.types
})

module.exports = Bonus
