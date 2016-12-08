module.exports = {
  Breadcrumbs: function(array) {
    this.url = ""
    this.store = array || []
    this.add = object => {
      object.url = this.url + object.url
      this.url = object.url
      this.store.push(object)
    }
  }
}
