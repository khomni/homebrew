'use strict';

const Promise = require('bluebird');
const Ajax = require('./ajax');
const Drag = require('./ui/drag');
let onXhrContentLoad = require('./dataemissions');

// Modal Constructor:
function Modal(options) {
  options = Object.assign({

  }, options||{});

  let thisModal = this;
  let href = options.href
  let elem = document.getElementById(options.target);
  if(elem) return elem.dispatchEvent(new Event('show.modal',{bubbles:true, cancelable:true}));
  if(!href && !options.html) return false;

  elem = document.createElement('div');
  elem.setAttribute('id', options.target || href);
  elem.classList.add('modal');
  if('width' in options) elem.style.width = options.width
  if('height' in options) elem.style.height = options.height

  elem.addEventListener('load', e => {
    if(options.html) elem.innerHTML = options.html
    if(!href) {
      return elem.dispatchEvent(new CustomEvent('loaded', {detail: null, bubbles:true, cancelable:true})); 
    }

    return Ajax.fetch({
      method: "GET",
      url: href,
      headers: {modal:true}
    })
    .then(xhr => {
      elem.innerHTML = xhr.responseText;
      elem.dispatchEvent(new CustomEvent('loaded', {detail:xhr, bubbles:true, cancelable:true}))
    })
    .catch(err => console.error(err));  
  })

  // shows the modal and brings it to the front
  elem.addEventListener('show.modal', e => {
    this.visible = true;
    elem.classList.add('shown');
    if(elem.parentNode && elem == elem.parentNode.lastChild) return true;
    let allModals = document.getElementById('modals');
    allModals.appendChild(elem); 
    elem.dispatchEvent(new Event('shown.modal', {bubbles:true, cancelable:true}));
  });

  elem.addEventListener('hide.modal', e => {
    this.visible = false;
    elem.classList.remove('shown');
  });

  elem.addEventListener('remove.modal', e => {
    this.visible = false;
    elem.remove();
    thisModal = null;
  })

  elem.addEventListener('keydown', e => {

  });
  elem.addEventListener('mousedown', e => {
    // allow alternate clicks for buttons or links
    if(e.target.nodeName == "BUTTON" || e.target.nodeName == "A") return true;
    if(e.which == 2) return elem.dispatchEvent(new Event('remove.modal',{bubbles:true, cancelable:true}));
    if(e.which == 1) return elem.dispatchEvent(new Event('show.modal',{bubbles:true, cancelable:true}));

    return true;
  },true);

  
  // if(!href) return elem.dispatchEvent(new Event('show.modal', {bubbles:true, cancelable:true}));

  // this listener performs any setup that needs to happen once when the modal is 
  elem.addEventListener('loaded', function onceLoaded(e){
    elem.removeEventListener('loaded', onceLoaded);

    Array.prototype.slice.call(elem.querySelectorAll('.modal-title'))
      .map(title => title.classList.add('handle'));
    thisModal.draggable = new Drag.Draggable(elem);

    // furnish the modal with a close button, if it doesn't have one already
    if(!elem.querySelector('button.close.close-modal')) {
      let close = document.createElement('button');
      close.classList.add('as-link','close', 'lg', 'float', 'close-modal');
      close.dataset.click = 'remove';
      close.dataset.target = '.modal';
      elem.insertBefore(close, elem.firstChild)
    }

    let focusable = Array.prototype.slice.call(elem.querySelectorAll('input,a,select,textarea,button:not(.close)'))
    focusable.map(i => {
      i.addEventListener('focus', e => {
        elem.dispatchEvent(new Event('show.modal', {bubbles:true, cancelable:true})); 
      }, true)
    });

    let rect = elem.getBoundingClientRect()
    let modalCenter = {
      x: (rect.right - rect.left) / 2,
      y: (rect.bottom - rect.top) / 2,
    }

    let center = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    }

    let variance  = {
      x: Math.random() * (window.innerWidth / 10) - window.innerWidth/20,
      y: Math.random() * (window.innerHeight / 10) - window.innerHeight/20
    }

    elem.style.top = Math.max(0,(center.y - modalCenter.y + variance.y)) + "px"
    elem.style.left = Math.max(0,(center.x - modalCenter.x  + variance.x)) + "px"
    
    elem.dispatchEvent(new Event('show.modal', {bubbles:true, cancelable:true}));
  })
  // load the content for the first time:
  elem.dispatchEvent(new Event('load', {bubbles:true, cancelable:true}));
}

module.exports = Modal;
