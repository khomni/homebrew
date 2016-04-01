var Navbar = require('./navbar');
var Favicon = require('./favicon');
var Modals = require('./modals');

var pageInitialized = false;

document.onreadystatechange = function(){
  if(pageInitialized) return;
  pageInitialized = true;
  Navbar.init();
  Modals.init();
  // Favicon.startSpin();
}
