// Pathfinder Ruleset
var System = require('../').builder

var Pathfinder = new System({
  // name / publisher information
  name: "Pathfinder",
  publisher: "Paizo",

  // terms
  terms: require('./terms'),

  // mechanics
  Item: require('./item'),
  Creature: require('./creature'),
  Quantifiable: require('./quant'),

})

module.exports = Pathfinder
