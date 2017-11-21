const Item = {
  id: item => item.id,
  value: item => item.value,
  weight: item => item.weight,
  quantity: item => item.quantity,
}

ItemCollection = {
  items: array => array,
  quantity: array => array.reduce((a,b) => null, null),
  value: array => array.reduce((a,b) => null, null),
  weight: array => array.reduce((a,b) => null, null),
}

module.exports = { Item, ItemCollection }
