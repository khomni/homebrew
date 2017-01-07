
function Breadcrumbs(array) {
  this.url = ""
  this.store = array || []
  this.add = object => {
    object.url = this.url +  object.url
    this.store.push(object)
    this.url = object.url
  }
}

var renderAsync = Promise.method(function(path,locals){
  var jade = require('jade');
  return jade.compileFile(path)(locals)
});

function get(string) {
  // bind this function to a nested object so that `this` refers to the object being worked on
  var thisObject = this

  if(!string) return thisObject
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


module.exports = {
  Breadcrumbs: Breadcrumbs,
  renderAsync: renderAsync,
  get: get
}
