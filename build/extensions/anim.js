'use strict';

var anim = {}

const Ticker = require('../ticks');

anim.scrollTo = function(target, options) {

  var scrollUpdate = new Ticker();

  scrollUpdate.tickWhile(() => {
    
    // find a place between the current scroll and the destination scroll
    let incrementalScroll = (target - window.scrollY) / 10
    let roundingOperation = incrementalScroll > 0 ? 'ceil' : 'floor'
    incrementalScroll = Math[roundingOperation](incrementalScroll)

    if(options.up == false && incrementalScroll < 0) return false;
    if(options.down == false && incrementalScroll > 0) return false;

    // TODO: timing functions
    // if(Math.abs(incrementalScroll) > 25) document.body.classList.add('scroll-blur');

    window.scrollTo(0, window.scrollY + incrementalScroll)
    document.dispatchEvent(new Event('scroll'))

    // if(Math.abs(incrementalScroll) < 25) document.body.classList.remove('scroll-blur')

    // establish conditions for looping
    if(Math.abs(window.scrollY - target) < 1 || (window.innerHeight + incrementalScroll > document.body.offsetHeight)) {
      // document.body.classList.remove('scroll-blur')
      return false;
    }  //  close enough

    return true;
  })

}


module.exports = anim
