'use strict';

const Promise = require('bluebird');

let Ajax = {}

Ajax.serializeMultipart = Promise.method(function(form){
  let fields = Array.prototype.slice.call(form.elements)
  let formData = new FormData();

  fields.filter(field => {
    return field.type === 'file'
  })
  .map(field => {
    for (let i=0; i<field.files.length; i++) formData.append(field.name, field.files[i])
  })

  return formData
})

Ajax.serialize = function(form) {
  var obj = {};
  var field, s = [];

  // make sure that the provided argument is a form node
  if (typeof form == 'object' && form.nodeName == "FORM") {
    var len = form.elements.length;

    var fields = Array.prototype.slice.call(form.elements)

    fields.map(field => {
      // ignore undesirable form elements
      if(field.disabled || ['button','submit','reset','file'].indexOf(field.type) >= 0) return false

      // multiple choice
      if(field.type == 'select-multiple') {
        return Array.prototype.slice.call(field.options).map(option => {
          if(!option.selected) return false
          if(!obj[field.name]) return obj[field.name] = option.value

          if(!Array.isArray(obj[field.name])) obj[field.name] = [obj[field.name]]
          obj[field.name].push(option.value)
        })
      }

      // checkboxes with support to track unchecked
      if(field.type == 'checkbox' || field.type == 'radio') {
        var value = field.checked ? field.value : field.getAttribute('default')
        if(!value) return false

        if(!obj[field.name]) return obj[field.name] = value

        if(!Array.isArray(obj[field.name])) obj[field.name] = [obj[field.name]]
        return obj[field.name].push(value)
      }

      var value = field.value || field.getAttribute('default')

      if(!obj[field.name]) return obj[field.name] = value

      if(!Array.isArray(obj[field.name])) obj[field.name] = [obj[field.name]]
      obj[field.name].push(value)
    })
  }
  return obj
}

Ajax.setListeners = function() {
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
        modal: thisForm.dataset.response == 'modal',
        Accept: thisForm.dataset.response == 'json' ? 'application/json' : undefined,
      },
      body:thisForm
    })
    .then(xhr =>{
      var contentType = xhr.getResponseHeader('Content-Type') || []
      if(contentType.includes('application/json')) {
        var response = JSON.parse(xhr.response)
        var dataEvent = new CustomEvent('data',{detail: response, bubbles:true})
        return thisForm.dispatchEvent(dataEvent)
      }

      var html = xhr.response

      if(thisForm.dataset.response == 'insert' || thisForm.dataset.response == 'replace') {
        if(!thisForm.dataset.target) throw new Error('No target to insert data')
        var target = document.getElementById(thisForm.dataset.target);
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
      console.error(err)
    })
  })
}

Ajax.fetch = Promise.method(function(args) {
  document.body.classList.add('loading');
  return Promise.resolve().then(() => {
    if(!args.body) return null;
    if(args.body.enctype === "multipart/form-data") {
      // return the file uploader or convert data into multipart/form-data
      // this needs to be async, since it needs to read the files
      return Ajax.serializeMultipart(args.body)
    }
    args.headers['Content-Type'] = 'application/json'
    return JSON.stringify(Ajax.serialize(args.body))
  })
  .then(data => {
    console.log(data)
    // for ordinary form data, send the serialized, stingified form data as a string
    let headers = {
      'X-Requested-With': 'XMLHttpRequest'
    };

    return new Promise(function(resolve,reject) {
      let xhr = new XMLHttpRequest()

      Object.assign(headers, args.headers)

      xhr.open(args.method, args.url)

      for(let key in headers) xhr.setRequestHeader(key, headers[key]);

      xhr.send(data)

      xhr.onreadystatechange = function() {
        if(xhr.readyState == XMLHttpRequest.DONE) {
          document.body.classList.remove('loading');
          return resolve(xhr)
        }
      }

      xhr.onerror = function() {
        return reject(xhr)
      }

    })
  })
});

Ajax.json = function(args) {
  args.headers = args.headers || {}
  Object.assign(args.headers, {'Content-Type': 'application/json', 'Accept': 'application/json'});
  return this.fetch(args).then(xhr => {
    console.log(xhr)
    return xhr.response
  });
};

Ajax.html = function(args) {
  args.headers = args.headers || {}
  Object.assign(args.headers, {'Content-Type': 'text/html', 'Accept': 'text/html'});
  return this.fetch(args).then(xhr => {return xhr.response});
};

module.exports = Ajax
