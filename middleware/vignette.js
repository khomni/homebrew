var fs = require('fs');

// var express = require('express');

var vignette = {
  getVignettes: function(cb){
    fs.readdir(appRoot + '/public/images/vignettes',function(err,files){
      if(err){
        console.error(err);
        cb([])
      }
      cb(files)
    })
  },
  getVignette: function(cb) {
    this.getVignettes(function(files){
      var vignettes = files
      vignettes[Math.floor(Math.random(vignettes.length))];
      cb(vignettes);
    });
  }
}
// use this to populate the default links in the navbar

module.exports = vignette;
