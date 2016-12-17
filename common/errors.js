module.exports = {
  authorization: function(message){
    var err = new Error()
    err.message = message || 'You do not have permission to do that'
    err.status = 403
    return err
  },
  notfound: function(message){
    var err = new Error()
    err.message = message + ' not found'
    err.status = 404
    return err
  },
  request: function(message){
    var err = new Error()
    err.message = message || 'Bad Request'
    err.status = 400
    return err
  }
}
