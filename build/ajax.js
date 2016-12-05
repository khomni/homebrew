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
    document.addEventListener('submit',function(e){
      var thisForm = e.target;
      if(!thisForm.dataset.response) return true;
      e.preventDefault();
      e.stopPropagation();

      var Modal = require('./modal');

      return Ajax.fetch({
        method: thisForm.getAttribute('method'),
        url: thisForm.action,
        headers:{
          modal:thisForm.dataset.response == 'modal',
          Accept: thisForm.dataset.response == 'json' ? 'application/json' : undefined,
        },
        body:thisForm
      })
      .then(response =>{
        //: TODO: figure out what the router sent and handle appropriately
        if(thisForm.dataset.response == 'json') return response.json()
        return response.text()
      })
      .then(response => {
        if(thisForm.dataset.response == 'modal') Modal.createModal(response);
        if(thisForm.dataset.response == 'json') {
          var dataEvent = new CustomEvent('data',{detail: response})
          thisForm.dispatchEvent(dataEvent)
        }
      })
      .catch(err =>{
        Modal.createModal(err);
      })

    })
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
    Object.assign({'Content-Type': 'text/html', 'Accept': 'text/html'}, args.headers);
    return this.fetch(args).then(response => {return response.text()});
  },

};

module.exports = Ajax
