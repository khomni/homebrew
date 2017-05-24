var Promise = require('bluebird');
var Ajax = require('./ajax');

var Drag = require('./ui/drag');

var modals = {}

function Modal(elem) {
  this.elem = elem
  var thisModal = this
  this.lastPosition = {}

  this.draggable = new Drag.Draggable(elem);

  thisModal.recenter = function(){
    var rect = elem.getBoundingClientRect()
    var modalCenter = {
      x: (rect.right - rect.left) / 2,
      y: (rect.bottom - rect.top) / 2,
    }

    var center = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }

    variance  = {
      x: Math.random() * (window.innerWidth / 10) - window.innerWidth/20,
      y: Math.random() * (window.innerHeight / 10) - window.innerHeight/20
    }

    elem.style.top = Math.max(0,(center.y - modalCenter.y + variance.y)) + "px"
    elem.style.left = Math.max(0,(center.x - modalCenter.x  + variance.x)) + "px"
  }

  this.hide = function(){
    this.visible = false;
    elem.classList.remove('shown')
  }

  this.remove = function(){
    elem.remove();
    delete this
  }

  this.focus = function() {
    this.visible = true;
    elem.classList.add('shown');
    // if the modal is already in the DOM and is currently the last modal, do not append
    if(elem.parentNode && elem == elem.parentNode.lastChild) return true
    document.getElementById('modals').appendChild(elem)

  }

  this.show = function(){
    thisModal.visible = true;
    elem.classList.add('shown')
    thisModal.focus();
    thisModal.recenter();
  }

  // elem.addEventListener('data', e => {
  //   let data = e.detail
  //   if(!data.error) return thisModal.remove()
  // })

  // prevent click events from reaching the modals parent
  elem.addEventListener('mousedown', e => {
    // allow alternate clicks for buttons or links
    if(e.target.nodeName == "BUTTON" || e.target.nodeName == "A") return true;
    if(e.which == 2) return thisModal.remove();
    if(e.which == 1) return thisModal.focus();

    return true;
  },true);

  var focusable = Array.prototype.slice.call(elem.querySelectorAll('input,a,button,select,textarea'))
  focusable.map(i => {
    i.addEventListener('focus', e => {
      thisModal.focus()
      return true;
    },true)
  });

  elem.modal = this
}

var methods = {

  init: function() {
    var modalContainer = document.getElementById('modals');

    // the only document level listener required to create new Modals
    document.body.addEventListener('click', e => {
      var spawner
      var spawner = e.target.closest('[data-response="modal"]')

      if(!spawner) return true;
      e.preventDefault();

      var url = spawner.getAttribute('href')

      var target = document.getElementById(spawner.dataset.target||url)

      if(!target) {
        if(!url) return false;
        target = document.createElement('div')
        target.classList.add('modal')
        target.id = spawner.dataset.target || Date.now() + url.replace(/\//gi,'-')
      }

      modalContainer.appendChild(target)

      // if the target element in question is not yet a modal, create one now

      // if the source does not have an href, just show the modal
      if(!url && target.modal) return target.modal.show();

      // if an href was provided, load the HTML from the server with the modal header,
      //   put the HTML in the modal, then run any scripts necessary
      Ajax.html({method:"GET", url:url, headers: {modal:true}})
      .then(html => {
        return Modal.methods.createModal(html, target)
      })
      .catch(err => {
        return Modal.methods.createModal(err, target)
      })

    },true)

  },

  loadModal: function(url,callback) {
    Ajax.html({
      method:"GET",
      url:url,
      headers: {modal:true}
    })
    .then(text => {
      Modal.dom.innerHTML = text
      var scripts = Modal.dom.querySelectorAll('script')
      for(var n=0; n<scripts.length; n++) {
        eval(scripts[n].innerHTML)
      }
      // Modal.dom.appendChild.call(newdiv.childNodes[0]);

      return callback();
    })
    .catch(err =>{
      return callback(err);
    })
  },

  createModal: function(html, target) {
    if(!target) {
      target = document.createElement('div');
      target.classList.add('modal')
      target.id = Date.now()
    }
    target.innerHTML = html
    var scripts = Array.prototype.slice.call(target.querySelectorAll('script'));
    scripts.map(script => {eval(script.innerHTML)});
    Array.prototype.slice.call(target.querySelectorAll('.modal-title')).map(title =>{title.classList.add('handle')})
    modals[target.id] = new Modal(target);

    if(!target.querySelector('button.close')) {
      let close = document.createElement('button');
      close.classList.add('as-link','close', 'lg', 'float');
      close.dataset.click = 'remove';
      close.dataset.target = '.modal';
      target.insertBefore(close, target.firstChild)
    }

    target.modal.show();
  },

};

module.exports = Modal;
module.exports.methods = methods
