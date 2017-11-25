const totalQuantity = (item) => {
  if(Array.isArray(item)) return item.reduce((a, subitem) => a + totalQuantity(subitem), 0)
  let subTotal = item.quantity
  if(item.items) subTotal += item.items.reduce((a, subitem) => a + totalQuantity(subitem), 0)
  return subTotal
}

const totalValue = (item) => {
  if(Array.isArray(item)) return item.reduce((a, subitem) => a + totalValue(subitem), 0)
  let subTotal = (item.value * item.quantity)
  if(item.items) subTotal += item.items.reduce((a, subitem) => a + totalValue(subitem), 0)
  return subTotal
}

const totalWeight = (item) => {
  if(Array.isArray(item)) return item.reduce((a, subitem) => a + totalWeight(subitem), 0)
  let subTotal = (item.weight * item.quantity)
  if(item.items) subTotal += item.items.reduce((a, subitem) => a + totalWeight(subitem), 0)
  return subTotal
}

const Item = {
  /*
  id: (item, args, context) => item.id,
  value: item => item.value,
  weight: item => item.weight,
  quantity: item => item.quantity,
  */
  total_weight: totalWeight,
  total_value: totalValue,
  total_quantity: totalQuantity,

  items: item => ({
    items: item.items,
    total_value: item.items.reduce((a,b) => a + totalValue(b), 0),
    total_weight: item.items.reduce((a,b) => a + totalWeight(b), 0),
    total_quantity: item.items.reduce((a,b) => a + totalQuantity(b), 0),
  })
}

module.exports = { Item, totalQuantity, totalValue, totalWeight }
