(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Navbar = require('./navbar');

document.onreadystatechange = function () {
  Navbar.setListeners();
}

},{"./navbar":2}],2:[function(require,module,exports){
var Navbar = {
  setListeners: function(){
    var dropdowns = document.getElementsByClassName('dropdown');
    for(i=0;i < dropdowns.length;i++) {
      var target = document.getElementById(dropdowns[i].dataset.target);
      dropdowns[i].addEventListener('mouseover',function(e){
        e.preventDefault();
        target.style.display = "block";
      },false);
      dropdowns[i].addEventListener('mouseout',function(e){
        e.preventDefault();
        target.style.display = "none";
      },false);
      console.log(target);
    }
  }
};

module.exports = Navbar;

},{}]},{},[1]);
