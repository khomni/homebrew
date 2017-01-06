module.exports = (err, req, res, next) => {
  err.status = err.status || 500;
  res.status(err.status);

  var errorActions = []

  if(err.name == 'SequelizeDatabaseError' || err.name == 'SequelizeHierarchyError') {
    console.error('['+CONFIG.database.name+']',err)

    // var modelName = err.sql.match(/FROM\s\"(.*?)\"/)
    // console.log(modelName,err.sql)
    // if(db[modelName]) errorActions.push(db[modelName].drop().then(()=>{return db[modelName].sync()}))
  } else if(err.status % 400 > 99) {
    console.error(err.stack)
  }


  Promise.all(errorActions)
  .catch(err => {console.error(err)})
  .finally(()=>{
    if(req.requestType('json')) return res.status(err.status).send(err)
    if(req.requestType('modal')) return res.render('modals/_error', {message: err.message, error: err})
    if(req.requestType('xhr')) return res.render('errorFragment',{error:err})
    return res.render('error', {message: err.message, error: err})
  })

}
