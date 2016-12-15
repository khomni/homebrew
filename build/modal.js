var Promise = require('bluebird');
var Ajax = require('./ajax');
var Ticker = require('./ticks');

var modals = {}

function Modal(elem) {
  this.elem = elem
  var thisModal = this
  this.lastPosition = {}

  this.hide = function(){
    this.visible = false;
    elem.classList.add('hidden')
  }

  this.remove = function(){
    elem.remove();
    delete this
  }

  this.show = function(){
    this.visible = true;
    elem.classList.remove('hidden')
  }

  var dragUpdate = new Ticker()
  elem.addEventListener('mousemove', e => {
    if(!thisModal.dragging) return true;

    dragUpdate.onTick(function(){
      if(!thisModal.dragging) return true;
      var rect = thisModal.dragging.getBoundingClientRect();
      rect.width = rect.right - rect.left
      rect.height = rect.bottom - rect.top
      elem.style.transform = "translate3d("+(e.screenX-rect.width/2)+"px,"+(e.screenY-rect.height*2)+"px,0)"
      // console.log(elem.style.top, elem.style.left)

    })
    e.preventDefault()
    return false;
  })

  elem.addEventListener('mousedown', e => {
    if(!e.target.classList.contains('handle')) return true;
    if(e.which != 1) return true;
    thisModal.dragging = e.target;
    document.getElementById('modals').appendChild(elem)
  })

  elem.addEventListener('mouseup', e => {
    this.dragging = false;
  });

  // prevent click events from reaching the modals parent
  elem.addEventListener('click', e => {
    document.getElementById('modals').appendChild(elem)
    e.stopPropagation();
    return true;
  })

  elem.modal = this
}

var methods = {

  init: function() {
    var modalContainer = document.getElementById('modals');

    // the only document level listener required to create new Modals
    document.body.addEventListener('click', e => {
      if(e.target.dataset.response != "modal") return true;
      e.preventDefault();

      var url = e.target.getAttribute('href')

      var target = document.getElementById(e.target.dataset.target||url)

      if(!target) {
        target = document.createElement('div')
        target.classList.add('modal')
        target.id = e.target.dataset.target || url
      }

      modalContainer.appendChild(target)

      // if the target element in question is not yet a modal, create one now
      if(!target.modal) modals[target.id] = new Modal(target)
      // if the source does not have an href, just show the modal
      if(!url) return target.modal.show();

      // if an href was provided, load the HTML from the server with the modal header,
      //   put the HTML in the modal, then run any scripts necessary
      Ajax.html({method:"GET", url:url, headers: {modal:true}})
      .then(html => {
        target.innerHTML = html
        var scripts = Array.prototype.slice.call(target.querySelectorAll('script'))
        scripts.map(script => {eval(script.innerHTML)})
        Array.prototype.slice.call(target.querySelectorAll('.modal-title')).map(title =>{title.classList.add('handle')})
      })
      .catch(err => {
        console.error(err)
      })

    },true)

    modalContainer.addEventListener('click',e => {
      // hide all modals?
      Object.keys(modals).map(key => {
        modals[key].remove()
      })

    })

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
        console.log(scripts[n].innerHTML)
        eval(scripts[n].innerHTML)
      }
      // Modal.dom.appendChild.call(newdiv.childNodes[0]);

      return callback();
    })
    .catch(err =>{
      return callback(err);
    })
  },

  createModal: function(html,callback) {
    Modal.dom.innerHTML = ""
    var newdiv = document.createElement('div');
    newdiv.innerHTML = html;
    Modal.dom.appendChild(newdiv.childNodes[0]);
    Modal.showModal();
  },

  showModal: function(){
    document.body.classList.add('modal-open');
    open = new Event('show')
    Modal.dom.dispatchEvent(open)
    Modal.dom.classList.add('open');
  },

  hideModal: function(){
    document.body.classList.remove('modal-open')
    hide = new Event('hide')
    Modal.dom.dispatchEvent(hide)
    Modal.dom.classList.remove('open');
  }

};

module.exports = Modal;
module.exports.methods = methods
