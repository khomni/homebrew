var Favicon = {
  newFrame: function(href){
    link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = href
    link.id = 'favicon'
    var head = document.getElementsByTagName('head')[0]
    head.removeChild(document.getElementById('favicon'))
    head.appendChild(link);
    // return link
  },
  getDegree: function() {
    return parseInt(document.getElementById('favicon').href.match(/[0-9]+(?=\.ico)/))
  },
  rotate: function(deg) {
    var newDegree = '/' + ((this.getDegree() + deg) % 90) + '.ico';
    Favicon.newFrame(newDegree);
    // this.dom.href = newDegree;
  },
  startSpin: function(deg) {
    if(!this.spinning) {
      var spinner = setInterval(function(){
        var ticking;
        if(!ticking){
          window.requestAnimationFrame(function(){
            Favicon.rotate(15);
            ticking = false
          })
        };
        ticking = true;
      },this.config.speed)
    }
  },
  stopSpin: function() {
    stopInterval(spinner);
    this.spinning = false;
  },
  rotate360: function() {

  },
  config: {
    speed: 125
  },
};

module.exports = Favicon;
