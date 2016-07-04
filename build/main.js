/*jslint node: true */

var Promise = require('promise');
var Ajax = require('./ajax');
var Navbar = require('./navbar');
var Favicon = require('./favicon');
var Modal = require('./modal');

var pageInitialized = false;

document.onreadystatechange = function(){
  if(pageInitialized) return;
  pageInitialized = true;
  Navbar.init();
  Modal.init();
  require('./bars');
  // Favicon.startSpin();
  Ajax.setListeners();
  window.Ajax = Ajax
  window.Modal = Modal

}
