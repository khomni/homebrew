module.exports = function(path){
  var jade = require('jade')
  return jade.compileFile(path)
}
