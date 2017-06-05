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
