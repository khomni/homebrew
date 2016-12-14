var fs = require('fs');
var path = require('path');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';

var races = []

var Race = function(obj) {
	for (key in obj) {
		if(!this[key]) this[key] = obj[key]
	}
}

fs.readdirSync(__dirname).filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var fileName = file.split('.')[0];
    var thisRace = require('./' + file);
		newRace = new Race(thisRace)
		races.push(newRace)
  });

module.exports = races
