function Ticker() {
  this.ticking = false;
  this.onTick = function(func){
    var thisTicker = this
    if(!this.ticking) {
      window.requestAnimationFrame(function(){
        thisTicker.ticking = false
        func();
      })
    }
    this.ticking = true
  }
}

module.exports = Ticker
