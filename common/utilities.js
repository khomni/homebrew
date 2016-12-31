module.exports = {
  Breadcrumbs: function(array) {
    this.url = ""
    this.store = array || []
    this.add = object => {
      object.url = this.url +  object.url
      this.store.push(object)
      this.url = object.url
    }
  },
  renderAsync: Promise.method(function(path,locals){
    var jade = require('jade');
    return jade.compileFile(path)(locals)
  })
}
