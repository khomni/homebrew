var Schema = require('js-schema');

function Quantifiable(args) {
  var thisQuant = this
  Object.assign(thisQuant,args)
  if(!Quantifiable.schema(thisQuant)) throw new Error('Quantifiable does not match schema')
}

Quantifiable.schema = Schema({
  label: String, // the user-facing name of the metric, e.g. "Movement Speed" or "Armor Check Penalty" or "Fire Resistance"
  // '?dice': Boolean // if dice == true, the quantifiable refers to a dice roll, so the bonus metrics need to be in the form `Array.of(2, Number.min(1)]`
});

module.exports = Quantifiable
module.exports.list = require('./list')
module.exports.bonus = require('./bonus')

var getNested = require(APPROOT+'/system/utilities/accessor')

module.exports.list.get = getNested.bind(module.exports.list)
