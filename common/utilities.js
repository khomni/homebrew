'use strict';

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

function dedupe(array) {
  if(!array) return array
  if(!Array.isArray(array)) return [array]
  var seen = {};
  var out = [];
  var len = array.length;
  var j = 0;
  for(var i = 0; i < len; i++) {
       var item = array[i];
       if(seen[item] !== 1) {
             seen[item] = 1;
             out[j++] = item;
       }
  }
  return out;
}

function get(object, string) {
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

module.exports = {
  Breadcrumbs: Breadcrumbs,
  renderAsync: renderAsync,
  get: get,
  dedupe: dedupe,
}
