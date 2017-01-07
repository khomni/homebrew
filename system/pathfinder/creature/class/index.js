// Pathfiner Items

// classes in the system
function Class(args) {
  var thisClass = this
  Object.assign(thisClass, args)

}

// the Item prototype schema describes the keys and data types accepted in the item's property field
Class.prototype.schema = {
  name: String,
  level: Number.min(1).max(20),
}


module.exports = Class
module.exports.classes = require('./list')
