var express = require('express');

// use this to populate the default links in the navbar
var navigation = function(req,res,next){
  function Navlink(options){
    this.type = options.type || 'link'
    this.url = options.url
    this.text = options.text
    this.sublinks = options.sublinks
    this.id = options.id
  };

  var navlinks = {};

  navlinks.home = new Navlink({type: 'link', url: '/', text: 'home'})

  if (req.user) {
    navlinks.user = new Navlink({type: 'dropdown', text: 'Account', id: 'userdropdown', sublinks: [{url:'/account',text:'My Account'},{url:'/logout',text:'Log Out'}]})
  }
  else {
    navlinks.user = new Navlink({type:'link'})
  }

  res.locals.navlinks = navlinks
  next();
}

module.exports = navigation;
