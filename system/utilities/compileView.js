module.exports = function(path){
  var pug = require('pug')
  return pug.compileFile(path)
}
