var Ajax = {
  // set up the DOM listeners
  setListeners: function() {
    var forms = document.getElementsByTagName('form')
    for(i=0; i<forms.length;i++) {
      forms[i].addEventListener('submit',function(e){
        e.preventDefault();
        console.log(e.target.method,e.target.action);
        Ajax.json({method: e.target.method, url: e.target.action})
          .then(xhr =>{console.log(xhr.responseText)})
          .catch(err =>{console.error(err)})
      })
    }
  },

  promise: function(args){
    return new Promise(function(resolve,reject){
      let xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function (e) {
        if(xhr.readyState == 4) { //
          if(xhr.status == 200) {
            resolve(xhr);
          } else {
            err = new Error(xhr);
            reject(err);
          }
        }
      }

      xhr.open(args.method||"GET", args.url, true);
      xhr.setRequestHeader('Content-type', args.contentType || 'text/html');
      if (typeof args.beforeSend === "function") args.beforeSend();
      xhr.send();
    })
  },


  request: function(args) {

    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function (e) {
      if(xhr.readyState == 4) { //
        if(xhr.status == 200) {
          if(args.success) return args.success(xhr.responseText)
        } else {
          err = new Error(xhr);
          if(args.fail) return args.fail(err);
        }
      }
    }

    xhr.open(args.method||"GET", args.url, true);
    xhr.setRequestHeader('Content-type', args.contentType || 'text/html');
    if (typeof args.beforeSend === "function") args.beforeSend();
    xhr.send();
  },

  json: function(args) {
    args.contentType = 'application/json';
    return this.promise(args);
  },
  html: function(args) {
    args.contentType = 'text/html';
    return this.promise(args);
  },

};

module.exports = Ajax
