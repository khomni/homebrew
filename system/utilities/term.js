// make a new term by passing it an object with 'singular' and 'plural' keys
// terms come equipped with a `.pluralize` prototype method
function Term(object) {
  if(typeof object == 'string') this.singular = object
  else this.singular = object.singular
  this.plural = object.plural || object.signular
  this.abbreviation = object.abbreviation || object.signular
}

Term.prototype.pluralize = function(number) {
  if(number == 1) return this.singular
  return this.plural || this.singular
}


Term.prototype.toString = function() {
  return this.abbreviation || this.singular
}

module.exports = Term
