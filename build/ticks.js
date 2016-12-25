function Ticker() {
  var thisTicker = this
  thisTicker.ticking = false;
  thisTicker.onTick = function(func){
    if(!thisTicker.ticking) {
      window.requestAnimationFrame(function(){
        thisTicker.ticking = false
        func();
      })
    }
    thisTicker.ticking = true
  }
}

module.exports = Ticker
