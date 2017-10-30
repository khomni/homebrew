import React, { Component } from 'react';

/* ==============================
 * From Utilities
 *      functions you can bind to a container to make forms work
 *      expects the container to be connect to the router using withRouter
 * ============================== */
export function serialize(form) {
  var obj = {};
  var field, s = [];

  // make sure that the provided argument is a form node
  if (typeof form === 'object' && form.nodeName === "FORM") {
    var len = form.elements.length;

    var fields = Array.prototype.slice.call(form.elements)
    var focusedButton = form.querySelector('button:focus')
    if(focusedButton && focusedButton.value) obj[focusedButton.name] = focusedButton.value

    console.log(obj);

    fields.map(field => {
      var value
      // ignore undesirable form elements
      if(field.disabled || ['button','submit','reset','file'].indexOf(field.type) >= 0) return false

      // multiple choice
      if(field.type === 'select-multiple') {
        return Array.prototype.slice.call(field.options).map(option => {
          if(!option.selected) return false
          if(!obj[field.name]) return obj[field.name] = option.value

          if(!Array.isArray(obj[field.name])) obj[field.name] = [obj[field.name]]
          obj[field.name].push(option.value)
        })
      }

      // checkboxes with support to track unchecked
      if(field.type === 'checkbox' || field.type === 'radio') {
        value = field.checked ? field.value : field.getAttribute('default')
        if(!value) return false

        if(!obj[field.name]) return obj[field.name] = value

        if(!Array.isArray(obj[field.name])) obj[field.name] = [obj[field.name]]
        return obj[field.name].push(value)
      }

      value = field.value || field.getAttribute('default')

      if(!obj[field.name]) return obj[field.name] = value

      if(!Array.isArray(obj[field.name])) obj[field.name] = [obj[field.name]]
      obj[field.name].push(value)
    })
  }
  return obj

}

export function submitData(event) {
  let { action, body, method, match } = this.props;
  body = JSON.stringify(body || serialize(event.target))

  event.preventDefault();

  return fetch(action, {method, body, credentials: 'include', headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }})
  .then(response => { 
    console.log(response);
    if(response.redirected) return history.pushState({}, null, response.url)

    return response.json()
    .then(data => {
      if(response.status !== 200 && this.onError) return this.onError(data);
      if(response.status === 200 && this.onResponse) return this.onResponse(data);
      console.log(data);
    })

    /* ==============================
     * Things to do:
     *  1. Handle Redirects / Reloadsif necessary
     *  2. change application state if necessary
     * ============================== */
  
  })
  .catch(err => {
    err 
  })

}

export default class Form extends Component {
  constructor(props) {
    super(props);
    this.submitData = submitData.bind(this);

    this.state = {
      body: {}
    }
  }



  render() {
    let { action, method, children } = this.props

    return (
      <form action={action} method={method} onSubmit={this.submitData}>
        { children }
      </form>
    
    )
  }
}

