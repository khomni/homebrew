module.exports = (err, req, res, next) => {
  res.status(err.status || 500);

  if(err.name == 'SequelizeDatabaseError') {
    console.log(err)
    switch(err.original.code) {
      case 42703: // column does not exist, database out of sync

    }
  }

  console.error(err.stack)

  if(req.requestType('json')) return res.status(err.status).send(err)
  if(req.requestType('modal')) return res.render('modals/_error', {message: err.message, error: err})
  return res.render('error', {message: err.message, error: err})
}
