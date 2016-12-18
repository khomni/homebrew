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
          var key = encodeURIComponent(field.name)
          if(obj[key]) {
            if(!Array.isArray(obj[key])) obj[key] = [obj[key]]
            obj[key].push(field.value)
          } else {
            obj[encodeURIComponent(field.name)] = field.value;
          }
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

      // TOOD: support for button formmethod and formaction

      // if the form doesn't specify a response and the form method is a normal post, then treat as a normal form submission
      if(!thisForm.dataset.response && thisForm.getAttribute('method').toLowerCase() == 'post') return true;
      e.preventDefault();
      e.stopPropagation();

      var Modal = require('./modal');

      // proprietary form handler!
      return Ajax.fetch({
        method: thisForm.getAttribute('method'), // supports PUT PATCH DELETE POST
        url: thisForm.action,
        headers:{ // allow the form to suggest ways of receiving the data
          modal:thisForm.dataset.response == 'modal',
          Accept: thisForm.dataset.response == 'json' ? 'application/json' : undefined,
        },
        body:thisForm
      })
      .then(response =>{
        var contentType = response.headers.get("content-type")
        if(contentType.includes('application/json')) {
          return response.json()
          .then(json => {
            var dataEvent = new CustomEvent('data',{detail: json, bubbles:true})
            return thisForm.dispatchEvent(dataEvent)
          })
        }
        return response.text()
        .then(html =>{
          Modal.methods.createModal(html);
        })
      })
      .catch(err =>{
        Modal.methods.createModal(err);
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
    return this.fetch(args).then(response => {return response.json().catch(err => {return response})});
  },
  html: function(args) {
    args.headers = args.headers || {}
    Object.assign(args.headers, {'Content-Type': 'text/html', 'Accept': 'text/html'});
    return this.fetch(args).then(response => {return response.text()});
  },

};

module.exports = Ajax
