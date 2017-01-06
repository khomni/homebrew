// recursively searches `this` using the provided string
function getNested(string) {
  // bind this function to a nested object so that `this` refers to the object being worked on
  var thisObject = this

  var args = string.split('.') // split the provided string into its component parts

  if(args.length == 1) return thisObject[args.pop()]

  if(thisObject[args[0]]) {
    var reference = thisObject[args[0]]
    // bind the method to the next level
    var recurse = getNested.bind(thisObject[args[0]])
    return recurse(args.splice(1).join('.'))
  }

  return null
}

// goes through a flat object with keys in dot notation and blows it up into a nested object
function unflatten(object) {
  var thisObject = object || this // the funciton is bound to the object to be unflattened

  // for each of the keys in the unflattening object, build out the objects and assign each key
  Object.keys(thisObject).map(keys => {
    // 'focus' on the reference to assign keys to it
    var focus = thisObject

    // split the dot-notation key by piece, then iteratively assign them to their predacessor
    // the final segment will be assigned with the value of the entire key
    keys.split('.').reduce((a,b)=>{
      focus[b] = focus[b] || {} // set the focus to an empty object if it doesn't already exist
      focus = focus[b] // change the reference to this object
      return b
    },null)

    key = keys.split('.').pop() // get the last key to insert the value
    focus[key] = thisObject[keys] // add the value to the last focused
    //recurse
  });

  return thisObject

}

module.exports = getNested
module.exports.unFlatten = unflatten
