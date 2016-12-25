/*jslint node: true */

var Promise = require('bluebird');
var Ajax = require('./ajax');
var Navbar = require('./navbar');
var Favicon = require('./favicon');
var Modal = require('./modal');
var Drag = require('./ui/drag');

var pageInitialized = false;

document.onreadystatechange = function(){
  if(pageInitialized) return;
  pageInitialized = true;

  require('./dataemissions');
  require('./ui/scroll');
  require('./keypress');

  Drag.init();
  Navbar.init();
  Modal.methods.init();
  // Favicon.startSpin();
  Ajax.setListeners();
  window.Ajax = Ajax
  window.Modal = Modal

}
