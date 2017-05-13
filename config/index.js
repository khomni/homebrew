// reads all files in settings and sets appropriate app.get('config') properties that are available wherever app or req.app are

var fs = require('fs');
var path = require('path');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';

var index = {}

fs.readdirSync(__dirname+'/settings').filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var fileName = file.split('.')[0]
    var allEnv =  require('./settings/'+file)
    if(allEnv[env]||allEnv['default']||allEnv['universal']) {
      var fileConfig = allEnv[env] || allEnv['default']
      index[fileName] = fileConfig;
      for(var key in allEnv['default']) {
        if(!index[fileName][key]) index[fileName][key] = allEnv['default'][key]
      }
    }
  });

module.exports = index
