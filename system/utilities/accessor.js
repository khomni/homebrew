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

module.exports = getNested
