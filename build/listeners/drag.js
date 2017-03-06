'use strict';

var dom = require('./dom.js');

(() => {

  window.addEventListener('dragenter', e => {
    if (e.target.tagName != "INPUT") {
      document.body.classList.remove('dropfile');
      return e.preventDefault();
    }
    console.log(e)
    document.body.classList.add('dropfile');
  },false)

  window.addEventListener('dragend', e => {
    document.body.classList.remove('dropfile');
  },false)

  window.addEventListener('drop', e => {
    if (e.target.tagName != "INPUT") return e.preventDefault();
    console.log('drop:',e.dataTransfer.files);
    document.body.classList.remove('dropfile');
    return e.preventDefault();
  },false)
})()
