// Pathfiner Items

// classes in the system
function Class(args) {
  var thisClass = this
  Object.assign(thisClass, args)

}

// the Item prototype schema describes the keys and data types accepted in the item's property field
Class.prototype.schema = {
  cl: Number,
  aura: String,
  enchantmentBonus: Number,
  properties: [String]
}


module.exports = Class
module.exports.classes = require('./list')
