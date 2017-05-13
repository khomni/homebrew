var seeds = require('../data/seeds');
var create = 0
var update = 0

var promises = {}

for(var key in seeds) {
  promises[key] = seeds[key].map(function(r){
    var query = {}
    var uniqueFields = Object.keys(db[key].uniqueKeys).map(function(k){
      var field = db[key].uniqueKeys[k].column
      query[field] = r[field]
    })
    return db[key].findOne({where: query||r})
    .then(record =>{
      if(record) {
        update++
        return record.update(r);
      }
      create++
      return db[key].create(r)
    })
  })
  promises[key] = Promise.all(promises[key])
}


return Promise.props(promises)
.then( results => {
  console.log('seeded '+create+' records')
  console.log('updated '+update+' records')
  return;
})
.catch(console.error)
