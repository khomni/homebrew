'use strict';
/*jslint node: true */

const Promise = require('bluebird');
const Ajax = require('./ajax');
const Navbar = require('./navbar');
const Favicon = require('./favicon');
const Modal = require('./modal');
const Drag = require('./ui/drag');
var pageInitialized = false;

document.onreadystatechange = function(){
  if(pageInitialized) return;
  pageInitialized = true;

  require('./polyfill');
  require('./keypress');

  // add document-level event listeners for the application

  Drag.init();
  // Modal.methods.init();
  // Favicon.startSpin();
  Ajax.setListeners();
  window.Ajax = Ajax
  window.Modal = Modal

  require('./listeners');
  require('./dataemissions');

}
