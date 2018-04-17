'use strict';

function System(args) {
  Object.assign(this, args)
}

// When being JSONified, just return basic information
System.prototype.toJSON = function(){
  return {
    name: this.name,
    publisher: this.publisher,
    year: this.year
  }
}

System.prototype.toString = function() {
  return this.name
}

// all available rulesets
System.RuleSets = {
  pathfinder: require('./pathfinder'),
}

module.exports = System
