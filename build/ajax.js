'use strict';

const Promise = require('bluebird');

let Ajax = {}

// takes a file (either form an image or a drop event) and uploads it directly to the specified route as multipart/form-data
Ajax.uploadFiles = (files, options) => {
  let formData = new FormData()
  Array.prototype.slice.call(files).forEach((file,i) => {
    formData.append('files', file)
  })

  let xhr = new XMLHttpRequest()
  xhr.open(options.method || 'post', options.url)
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('modal', true);
  xhr.send(formData)

  return xhr
}

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

  // FORM SUBMIT OVERRIDE
  // listens for form submissions at the document-level and
  //    1) modifies the request based on the attributes of the form and inputs
  //      1a) Allows buttons to change the method or action of the containing form
  //    2) Changes the default form behavior on response based on the provided request header

  document.addEventListener('submit', function(e) {
    var thisForm = e.target;
    var Modal = require('./modal');
    // TOOD: support for button formmethod and formaction

    e.preventDefault();
    e.stopPropagation();

    // collect the method and action from the form or the button pressed, if applicable
    var thisFocus = thisForm.querySelector(':focus')
    var method = thisFocus.getAttribute('formmethod') || thisForm.getAttribute('method')
    var action = thisFocus.getAttribute('formaction') || thisForm.action
    var reaction = thisFocus.dataset.response || thisForm.dataset.response
    // proprietary form handler!
    return Ajax.fetch({
      method: method, // supports PUT PATCH DELETE POST
      url: action,
      headers:{ // allow the form to suggest ways of receiving the data
        modal: true,
        Accept: thisForm.dataset.response == 'json' ? 'application/json' : undefined,
      },
      body:thisForm
    })
    .then(xhr => {
      let redirect = xhr.getResponseHeader('X-Redirect')
      if(redirect) {
        history.pushState({href: redirect},null,redirect);
        return document.getElementById('main').dispatchEvent(new CustomEvent('load.pane', {detail:{href:redirect}, bubbles:true, cancelable:true}))
        // load the redirect content to main
      }

      // if the router responds with JSON data, emit it from the form as a 'data' event
      var contentType = xhr.getResponseHeader('Content-Type') || []
      if(contentType.includes('application/json')) {
        var response = JSON.parse(xhr.response)
        var dataEvent = new CustomEvent('data', {detail: response, bubbles:true})
        return thisForm.dispatchEvent(dataEvent)
      }

      // otherwise, collect the HTML response and handle accordingly
      var html = xhr.response

      // TODO: have the router coerce the response type with headers, rather than rely on the form to make that decision
      if(xhr.getResponseHeader('X-Modal')) {
        return Modal.methods.createModal(html)
      }

      var target = document.getElementById(thisFocus.dataset.target || thisForm.dataset.target)
      
      if(reaction == 'insert' || reaction == 'replace') {
        if(!target) throw new Error('No target to insert data')
        if(reaction == 'insert') target.innerHTML = html
        if(reaction == 'replace') {
          reaction = document.createElement('div')
          reaction.innerHTML = html
          var elems = Array.prototype.slice.call(reaction.childNodes)
          elems.map(e=>{target.parentNode.insertBefore(e,target)})
          target.remove();
        }
        return;
      }

      // return Modal.methods.createModal(html);
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
    // for ordinary form data, send the serialized, stingified form data as a string
    let headers = {
      'X-Requested-With': 'XMLHttpRequest'
    };

    return new Promise(function(resolve,reject) {
      let xhr = new XMLHttpRequest()

      Object.assign(headers, args.headers)

      xhr.open(args.method.toUpperCase(), args.url)

      for(let key in headers) xhr.setRequestHeader(key, headers[key]);

      xhr.send(data)

      xhr.onreadystatechange = function() {
        if(xhr.readyState == XMLHttpRequest.DONE) {
          document.body.classList.remove('loading');
          return resolve(xhr)
        }
      }

      xhr.onerror = function(e) {
        return reject(new Error('An error occurred with the XHR Request'))
      }

    })
  })
});

Ajax.json = function(args) {
  args.headers = args.headers || {}
  Object.assign(args.headers, {'Content-Type': 'application/json', 'Accept': 'application/json'});
  return this.fetch(args).then(xhr => {
    return xhr.response
  });
};

Ajax.html = function(args) {
  args.headers = args.headers || {}
  Object.assign(args.headers, {'Content-Type': 'text/html', 'Accept': 'text/html'});
  return this.fetch(args).then(xhr => {return xhr.response});
};

module.exports = Ajax
