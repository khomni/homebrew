// given an array of object, maps all values of the provided key
Array.prototype.mapKey = function(key) {
  return this.map(elem => {
    return elem[key]
  })
}

// given a function that takes a single element as an argument
// returns the first element in the array that satisfies the function
Array.prototype.find = function(func) {
  for(var i in this) {
    if(func(this[i])) return this[i]
  }
  return null
}

Promise.while = Promise.method(function(condition, action) {
    if (!condition()) return;
    return action().then(Promise.while.bind(null, condition, action));
});

Object.get = function get(object, string) {
  // bind this function to a nested object so that `this` refers to the object being worked on
  var thisObject = string ? object : this
  var string = string || object
  if(typeof string != 'string') return string

  if(!string && !object) return thisObject
  var args = string.split('.') // split the provided string into its component parts

  if(args.length == 1) return thisObject[args.pop()]

  if(thisObject[args[0]]) {
    var reference = thisObject[args[0]]
    // bind the method to the next level
    var recurse = get.bind(thisObject[args[0]])
    return recurse(args.splice(1).join('.'))
  }

  return null
}
