const Item = {
  id: item => item.id,
  value: item => item.value,
  weight: item => item.weight,
  quantity: item => item.quantity,
  total_weight: item => {
    let thisWeight = (item.weight * item.quantity)
    // TODO: total weight of all contained items
    return thisWeight;
  },
  total_value: item => {
    let thisValue = (item.value * item.quantity)
    // total value of all contained items
    return thisValue;
  },
}

ItemCollection = {
  items: array => array,
  total_quantity: array => array.reduce((a,b) => a + b.quantity, 0),
  total_value: array => array.reduce((a,b) => a + (b.quantity * b.quantity), 0),
  total_weight: array => array.reduce((a,b) => a + (b.weight * b.quantity), 0),
}

module.exports = { Item, ItemCollection }
