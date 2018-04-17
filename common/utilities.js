'use strict';

const _ = require('lodash');
const flat = require('flat');

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
  string = string || object
  if(typeof string !== 'string') return string

  if(!string && !object) return thisObject
  var args = string.split('.') // split the provided string into its component parts

  if(args.length === 1) return thisObject[args.pop()]

  if(thisObject[args[0]]) {
    var reference = thisObject[args[0]]
    // bind the method to the next level
    var recurse = get.bind(thisObject[args[0]])
    return recurse(args.splice(1).join('.'))
  }

  return null
}

var counter = 0
const COUNTER_MAX = 256

// generates a base64 GUID of given length based on the current time
// uses an 8 bit counter integer to ensure simultaneous entries get unique GUIDs
function generateGUID() {

  counter = ++counter % COUNTER_MAX
  let counterString = _.padStart(String(counter), 3, '0');
  let buffer = new Buffer(String(Date.now()) + '-' + counterString)
  return buffer.toString('base64');

}

module.exports = {
  generateGUID,
  get,
  dedupe,
}
