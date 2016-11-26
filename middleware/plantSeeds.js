module.exports = (req, res, next) => {

  var seeds = require(APPROOT+'/data/seeds');

  var promises = []

  for(key in seeds) {
    var recordsToSeed = seeds[key]

    console.log('adding '+recordsToSeed.length+' records to '+key)
    promises.push(db[key].bulkCreate(recordsToSeed))

  }

  Promise.all(promises)
  .catch(console.error)
  .finally(next)

}
