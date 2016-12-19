// Pathfiner Items

// items in the system
function Item(args) {
  this.blueprint = args
  // Object.keys(args).map(key => {
  //
  // })
}

// the Item prototype schema describes the keys and data types accepted in the item's property field
Item.prototype.schema = {
  cl: Number,
  aura: String,
  enchantmentBonus: Number,
  properties: [String]
}


module.exports = Item
module.exports.items = require('./list')
