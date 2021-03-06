function System(args) {
  Object.assign(this,args)
}

// System prototype methods here
// this should be the API interface used to request various resources from the system
// each system can define its own methods of responding to such requests.
var jade = require('jade')

System.prototype.render = function(path,locals){
  return jade.renderFile(this.view + path, Object.assign(this,locals))
}

// export the system constructor so rulesets can access it
module.exports.builder = System

// all available rulesets
var RuleSets = {
  pathfinder: require('./pathfinder'),
}

// export the rulesets object
module.exports = RuleSets
