var Navbar = require('./navbar');
var Favicon = require('./favicon');
var Modal = require('./modal');

var pageInitialized = false;

document.onreadystatechange = function(){
  if(pageInitialized) return;
  pageInitialized = true;
  Navbar.init();
  Modal.init();
  // Favicon.startSpin();
}
