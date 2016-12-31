var Quantifiable = require('./')

// a keyed object of all preconstructed metrics
// this list is used to determine what things bonuses can be applied to
var quantifiable = {
  ac: {label: "Armor Class"},
  damage: {label: "Damage"},
  attack: {label: "Attack"},
  base_attack: {label: "Base Attack"},
  speed: {
    base: {label: "Base Movement Speed"},
    flight: {label: "Flight Speed"},
    climb: {label: "Climb Speed"},
    swim: {label: "Swim Speed"},
  },
  resistance: {
    fire: {label: "Fire Resistance"},
    cold: {label: "Cold Resistance"},
    electricity: {label: "Electricity Resistance"},
    poison: {label: "Poison Resistance"},
    damage: {label: "Damage Resistance"},
    spell: {label: "Spell Resistance"},
  },
  attribute: {
    str: {label: "Strength"},
    dex: {label: "Dexterity"},
    con: {label: "Constitution"},
    int: {label: "Intelligence"},
    wis: {label: "Wisdom"},
    cha: {label: "Charisma"},
  },
  saving_throw: {
    ref: {label: "Reflex Saving Throws"},
    fort: {label: "Fortitude Saving Throws"},
    will: {label: "Will Saving Throws"},
  },

}

// an array of all valid keys, flattened
var flatKeys = []

// convert all metrics into Quantifiable instances
function recursiveConvert(object,trace) {
  trace = trace ? (trace + '.') : '';
  Object.keys(object).map(i => {
    var thisTrace = trace + i
    if('label' in object[i]) {
      object[i] = new Quantifiable(object[i])
      flatKeys.push(thisTrace)
      return true
    }

    if(typeof object[i] == 'object') return recursiveConvert(object[i],thisTrace)
  })
}

recursiveConvert(quantifiable)

module.exports = quantifiable // export the object
module.exports.keys = flatKeys // export an array of keys so other modules can access them
