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

  // alternate use, runs the function until the predicate returns true
  // use this for 
  thisTicker.tickWhile = function(func,cb) {
    thisTicker.ticking = true;
    window.requestAnimationFrame(() => {
      thisTicker.ticking = false;
      if(func() != false) return thisTicker.tickWhile(func, cb)
      if(cb) return cb();
    })
  }
}

module.exports = Ticker
