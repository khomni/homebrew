var fs = require('fs');

var vignette = {
  jsonify: function(cb){
    var vignetteMeta = require(APPROOT + "/data/vignettes.json");

    this.getVignettes(function(files){
      for(i=0;i<files.length;i++) {
        vignetteMeta[files[i]] = vignetteMeta[files[i]] || {path: '/images/vignettes/' + files[i], focus: [50,50], attribution: ""}
      }
      var vignettes = JSON.stringify(vignetteMeta,null,"\t")
      fs.writeFile(APPROOT + '/data/vignettes.json', vignettes, function(err){
        if(err){return cb(err)};
        cb(null)
      })
    })
  },
  getVignettes: function(cb){
    fs.readdir(APPROOT + '/public/images/vignettes',function(err,files){
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
