module.exports = {
  hashString: function(string){
    if (Array.prototype.reduce){
      return string.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    }
    var hash = 0;
    if (string.length === 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var character  = this.charCodeAt(i);
        hash  = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  },

  handleRequest: function(req, object) {
    if(/application\/json/.test(req.get('accept'))) return object['json'] || object['default']
    if(req.xhr) return object['xhr'] || object['default']
    else return object['default']
  }

};
