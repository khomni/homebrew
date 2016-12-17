//

var RuleSets = {
  pathfinder: require('./pathfinder'),
}

module.exports = RuleSets
module.exports.names = Object.keys(RuleSets).map(key => {return RuleSets[key].name})
