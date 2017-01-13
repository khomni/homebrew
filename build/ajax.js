function serialize(form) {
  var obj = {};
  var field, s = [];
  if (typeof form == 'object' && form.nodeName == "FORM") {
    var len = form.elements.length;
    for (var i=0; i<len; i++) {
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

      var thisFocus = thisForm.querySelector(':focus')
      var method = thisFocus.getAttribute('formmethod') || thisForm.getAttribute('method')
      var action = thisFocus.getAttribute('formaction') || thisForm.action
      var Modal = require('./modal');

      // proprietary form handler!
      return Ajax.fetch({
        method: method, // supports PUT PATCH DELETE POST
        url: action,
        headers:{ // allow the form to suggest ways of receiving the data
          modal:thisForm.dataset.response == 'modal',
          Accept: thisForm.dataset.response == 'json' ? 'application/json' : undefined,
        },
        body:thisForm
      })
      .then(xhr =>{

        var contentType = xhr.getResponseHeader('Content-Type');
        if(contentType.includes('application/json')) {
          var response = JSON.parse(xhr.response)
          var dataEvent = new CustomEvent('data',{detail: response, bubbles:true})
          return thisForm.dispatchEvent(dataEvent)
        }

        var html = xhr.response

        if(thisForm.dataset.response == 'insert' || thisForm.dataset.response == 'replace') {
          if(!thisForm.dataset.target) throw new Error('No target to insert data')
          var target = document.getElementById(thisForm.dataset.target)
          if(thisForm.dataset.response == 'insert') target.innerHTML = html
          if(thisForm.dataset.response == 'replace') {
            var response = document.createElement('div')
            response.innerHTML = html
            var elems = Array.prototype.slice.call(response.childNodes)
            elems.map(e=>{target.parentNode.insertBefore(e,target)})
            target.remove();
          }
          return;
        }
        return Modal.methods.createModal(html);
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

    return new Promise(function(resolve,reject){
      var xhr = new XMLHttpRequest()
      // Promise.promisifyAll(xhr)

      Object.assign(init.headers, args.headers)

      xhr.open(args.method, args.url)

      for(key in init.headers) {
        xhr.setRequestHeader(key, init.headers[key])
      }

      xhr.send(data)

      xhr.onreadystatechange = function() {
        if(xhr.readyState == XMLHttpRequest.DONE) {
          if(xhr.status == 200) return resolve(xhr)
          var err = new Error(xhr);
          err.status = xhr.status;
          err.statusText = xhr.statusText;
          err.message = xhr.responseText;
          return reject(err);
        }
      }
    })
  },

  json: function(args) {
    args.headers = args.headers || {}
    Object.assign(args.headers, {'Content-Type': 'application/json', 'Accept': 'application/json'});
    return this.fetch(args).then(xhr => {
      console.log(xhr)
      return xhr.response
    });
  },
  html: function(args) {
    args.headers = args.headers || {}
    Object.assign(args.headers, {'Content-Type': 'text/html', 'Accept': 'text/html'});
    return this.fetch(args).then(xhr => {return xhr.response});
  },

};

module.exports = Ajax
