function serialize(form) {
  var obj = {};
  var field, s = [];
  if (typeof form == 'object' && form.nodeName == "FORM") {
    var len = form.elements.length;
    for (i=0; i<len; i++) {
      field = form.elements[i];
      if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
        if (field.type == 'select-multiple') {
          for (j=form.elements[i].options.length-1; j>=0; j--) {
            if(field.options[j].selected) {
              obj[encodeURIComponent(field.name)] = field.options[j].value;
            }
          }
        } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
          obj[encodeURIComponent(field.name)] = field.value;
        }
      }
    }
  }
  return obj
}

var Ajax = {
  // set up the DOM listeners
  setListeners: function() {
    var forms = document.getElementsByTagName('form')
    for(i=0; i<forms.length;i++) {
      (function(j){forms[j].addEventListener('submit',function(e){
        var thisForm = this
        e.preventDefault();
        var Modal = require('./modal');
        Ajax.html({
          method: thisForm.getAttribute('method'),
          url: this.action,
          headers:{
            modal:true,
          },
          body:forms[j]
        })
        .then(response =>{
          Modal.createModal(response);
        })
        .catch(err =>{
          Modal.createModal(err);
        })
      })})(i);
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
            err.status = xhr.status;
            err.statusText = xhr.statusText;
            err.message = xhr.responseText;
            reject(err);
          }
        }
      }

      xhr.open(args.method||"GET", args.url, true);

      xhr.setRequestHeader('Content-type', args.contentType || 'text/html');
      xhr.setRequestHeader('Accept', args.accept || 'text/html');
      if (typeof args.beforeSend === "function") args.beforeSend();
      xhr.send(args.data);
    })
  },

  fetch: function(args) {
    if(args.body) {
      if(args.body.nodeName === "FORM") {
        args.headers['Content-Type'] = 'application/json'
        var data = JSON.stringify(serialize(args.body))
      }
      else if(typeof args.data === 'object') {
        args.headers['Content-Type'] = 'application/json'
        var data = JSON.stringify(args.data);
      }
    }
    var init = {
      method: args.method,
      mode: 'same-origin',
      credentials: 'same-origin',
      headers: {
        'Content-Type':'text/html',
        'Accept':'text/html',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: data || null
    }

    for(key in args.headers) {
      init.headers[key] = args.headers[key]
    }

    return fetch(args.url,init);

  },

  json: function(args) {
    args.headers = args.headers || {}
    Object.assign(args.headers, {'Content-Type': 'application/json', 'Accept': 'application/json'});

    return this.fetch(args).then(response => {return response.json()});
  },
  html: function(args) {
    args.headers = args.headers || {}
    Object.assign(args.headers, {'Content-Type': 'text/html', 'Accept': 'text/html'});
    return this.fetch(args).then(response => {return response.text()});
  },

};

module.exports = Ajax
