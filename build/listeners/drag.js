'use strict';

var dom = require('./dom.js');

(() => {

  function mouseOut(e){
    console.log('mouseout')
    document.body.classList.remove('dropfile')
  }

  window.addEventListener('dragenter', e => {
    window.addEventListener('mouseout', mouseOut)
    document.body.classList.add('dropfile');
  }, false)

  window.addEventListener('dragend', e => {
    console.log('exit:', e.target)
    window.removeEventListener('mouseout', mouseOut)
    document.body.classList.remove('dropfile');
  },false)

  window.addEventListener('drop', e => {
    window.removeEventListener('mouseout', mouseOut)
    if (e.target.tagName != "INPUT") return e.preventDefault();
    console.log('drop:',e.dataTransfer.files);
    document.body.classList.remove('dropfile');
    return e.preventDefault();
  },false)
})()
