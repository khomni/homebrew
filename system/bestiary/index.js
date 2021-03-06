
var fs = require('fs');
var path = require('path')
var read = Promise.promisify(fs.readFile);
var write = Promise.promisify(fs.writeFile);

var dataParser = require(APPROOT+"/system/dataParser")
var parse = Promise.promisify(dataParser.toSchemaObject)

try {
	stats = fs.lstatSync(APPROOT+"/system/bestiary/bestiary.json");
	if(stats.isFile()) {
		module.exports = require(APPROOT+"/system/bestiary/bestiary.json")
	}
} catch(e) {
	console.error(e);
	read(APPROOT+"/system/bestiary/bestiary.txt", 'utf8')
	.then(data => {
		return new Promise(function(resolve,reject) {
			try {
				out = dataParser.toSchemaObject(data)
				resolve(out)
			} catch(e) {
				reject(e)
			}
		})
	})
	.then(data => {
		var json = JSON.stringify(data,null,"\t")
		return write(APPROOT+"/system/bestiary/bestiary.json", json)
	})
	.then(() => {
		module.exports = require(APPROOT+"/system/bestiary/bestiary.json")
	})
	.catch(err => {
		console.error(err.stack)
		module.exports = err
	})
}
