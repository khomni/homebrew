// Pathfiner Items
var Schema = require('js-schema')

// items in the system
function Item(args) {
  var thisItem = this
  Object.assign(this,args)
  if(!Item.schema(thisItem)) throw new Error('Item does not match schema')
}

Item.slots = ['head', 'headband', 'eyes', 'shoulders', 'neck', 'chest', 'body', 'armor', 'belt', 'writs', 'hands', 'ring', 'feet']
Item.auras = ['abjuration','conjuration','divination','enchantment','evocation','illustion','necromancy','transmutation']
Item.tags = require('./tags')

var Quantifiable = require('../quant')

// the Item prototype schema describes the keys and data types accepted in the item's property field
Item.schema = Schema({
  '?hpMax': Number.min(1), // current HP is handled by the instantiation
  '?cl': Number.min(0),
  '?aura': Item.auras['abjuration','conjuration','divination','enchantment','evocation','illustion','necromancy','transmutation'],
  // '?enhancementBonus': Number.min(0).max(5),
  '?bonuses': Array.of(Quantifiable.bonus.schema),
  '?abilities': Array.of(String),
  '?slot': Item.slots,
  '?hands': [0, 1, 2], // assume an item can be carried in one or two hands if unspecified, or cannot be carried if 0,
  '?tag': module.exports.tags // a list of item tags for classification purposes
})

module.exports = Item
// a list of prebaked item constructions (blueprints)
module.exports.items = require('./list')
