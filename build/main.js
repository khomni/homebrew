var Navbar = require('./navbar');
var Favicon = require('./favicon');
var pageInitialized = false;

document.onreadystatechange = function(){
  if(pageInitialized) return;
  pageInitialized = true;
  Navbar.init();
  // Favicon.startSpin();
}
