module.exports = {
  Breadcrumbs: function(array) {
    this.url = ""
    this.store = array || []
    this.add = object => {
      object.url = this.url +  object.url
      this.store.push(object)
      this.url = object.url
    }
  },
  renderAsync: Promise.method(function(path,locals){
    var jade = require('jade');
    return jade.compileFile(path)(locals)
  }),
  unflatten: function(object) {
    var thisObject = object || this // the funciton is bound to the object to be unflattened

    // for each of the keys in the unflattening object, build out the objects and assign each key
    Object.keys(thisObject).map(keys => {
      // 'focus' on the reference to assign keys to it
      var focus = thisObject

      if(keys.split('.').length == 1) return

      // split the dot-notation key by piece, then iteratively assign them to their predacessor
      // the final segment will be assigned with the value of the entire key
      keys.split('.').reduce((a,b)=>{
        // TODO: notation for building arrays of objects
        // if(/^\[.*\]$/.test(a))

        focus[a] = focus[a] || {} // set the focus to an empty object if it doesn't already exist
        focus = focus[a] // change the reference to this object
        return b
      })

      key = keys.split('.').pop() // get the last key to insert the value
      focus[key] = thisObject[keys] // add the value to the last focused
      delete thisObject[keys]
      //recurse
    });
    return thisObject
  }
}
