const colors = require('colors');

function Logger({name, color, precondition, enabled = true}){
  this.name = name
  this.color = color
  this.precondition = precondition
  this.enabled = enabled

  this.log = this.log.bind(this)
  this.when = this.when.bind(this)
  this.log.when = this.when.bind(this);

  return this;
}

// returns a new logger based on the instance that only logs when the specified precondition or handler is true
Logger.prototype.when = function({precondition, enabled}){
  return new Logger(Object.assign(this, {precondition, enabled}))
}

Logger.prototype.log = function(...args){
  // the logger has been disabled
  if(!this.enabled) return false
  // a precondition was specified, and returns false
  if(this.precondition && !this.precondition()) return false;

  args.unshift(`[${this.name}::${new Date().toISOString()}]`)

  return console.log(colors[this.color].apply(null, args))
}


module.exports = Logger
