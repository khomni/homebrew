module.exports = (err, req, res, next) => {
  err.status = err.status || 500;
  res.status(err.status);

  var errorActions = []

  
  if(/^Sequelize/.test(err.name)) {
    console.error(err.name, err.errors)
    err.original.status = err.status
    err = err.original
  } 
  
  if(err.status % 400 > 99) {
    console.error(err.stack)
  }


  Promise.all(errorActions)
  .catch(err => {console.error(err)})
  .finally(()=>{
    // if(req.json) return res.status(err.status).send(err)
    if(req.xhr) {
      res.set('X-Modal', true)
      return res.render('modals/_error', {message: err.message, error: err})
    }

    if(req.json) return res.status(err.status).json({
      message: err.message, 
      error: err, 
      stack: process.env.NODE_ENV!='production'?err.stack.split(/\n\s*/g):undefined
    }) // when looking for a json response, render an error modal anyway

    return res.render('error', {message: err.message, error: err})
  })

}
