module.exports.error = require('./errors')
module.exports.utilities = require('./utilities')
module.exports.middleware = require('./middleware')

module.exports.hashString = function(string){
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
}

module.exports.zeropad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

module.exports.toRGB = i => {
  let c = (i & 0x00FFFFFF).toString(16).toUpperCase();
  return "00000".substring(0, 6 - c.length) + c;
}

module.exports = module.exports;

