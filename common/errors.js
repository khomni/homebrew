module.exports = {
  authorization: function(message){
    var err = new Error()
    err.message = message || 'You do not have permission to do that'
    err.status = 403
    return err
  }
}