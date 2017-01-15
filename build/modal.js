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


  // prevent click events from reaching the modals parent
  elem.addEventListener('mousedown', e => {
    if(e.which == 2) thisModal.remove();
    if(e.which == 1) thisModal.focus();
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
      for(var i=0; i<e.path.length;i++) {
        // if(!e.path[i]) return true
        if(e.path[i].dataset && e.path[i].dataset.response == 'modal') {
          spawner = e.path[i]
          break;
        }
      }

      if(!spawner) return true;
      e.preventDefault();

      var url = spawner.getAttribute('href')

      var target = document.getElementById(spawner.dataset.target||url)

      if(!target) {
        target = document.createElement('div')
        target.classList.add('modal')
        target.id = e.target.dataset.target || +Date.now()+url.replace(/\//gi,'-')
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

    // modalContainer.addEventListener('click',e => {
    //   // hide all modals?
    //   Object.keys(modals).map(key => {
    //     modals[key].remove()
    //   })
    // })

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
    var scripts = Array.prototype.slice.call(target.querySelectorAll('script'))
    scripts.map(script => {eval(script.innerHTML)})
    Array.prototype.slice.call(target.querySelectorAll('.modal-title')).map(title =>{title.classList.add('handle')})
    modals[target.id] = new Modal(target)
    target.modal.show();
  },

};

module.exports = Modal;
module.exports.methods = methods
