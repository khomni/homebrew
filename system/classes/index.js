var fs = require('fs');
var path = require('path');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';

var races = []

var Class = function(obj) {
	for (key in obj) {
		if(!this[key]) this[key] = obj[key]
	}
}

fs.readdirSync(__dirname).filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var fileName = file.split('.')[0];
    var thisClass = require('./' + file);
		newClass = new Class(thisRace)
		races.push(newClass)
  });

module.exports = races
