'use strict';

const dom = require('./dom.js');
const Ajax = require('../ajax');
const Modal = require('../modal');

(() => {

  var mouseOut = function(e) {
    document.body.classList.remove('dropfile')
  }

  window.addEventListener("dragover", e => {
    e.preventDefault();
  },false);

  window.addEventListener('dragenter', e => {
    window.addEventListener('mouseout', mouseOut)
    document.body.classList.add('dropfile');
  }, false)

  window.addEventListener('dragend', e => {
    window.removeEventListener('mouseout', mouseOut)
    document.body.classList.remove('dropfile');
  }, false)

  window.addEventListener('drop', e => {
    e.preventDefault();
    window.removeEventListener('mouseout', mouseOut)
    let dropArea = e.target.closest('.drop-area')
    if(!dropArea) return false;
    let form = dropArea.querySelector('form.drop-target')
    if(!form || !e.dataTransfer.files.length) return true;

    document.body.classList.add('loading');
    let upload = Ajax.uploadFiles(e.dataTransfer.files,{url: form.action, method: form.method})

    upload.onreadystatechange = () => {
      if(upload.readyState == upload.DONE) {
        document.body.classList.remove('loading');

        if(upload.status != 200) return Modal.methods.createModal(upload.responseText);

        dropArea.dispatchEvent(new Event('reload', {bubbles:true, cancelable:true}));

        // return window.location.reload();


      }
      if (upload.readyState != null && (upload.readyState < 3 || upload.status != 200)) return null
      // incremental upload data here

    }

    return false;

  },false)
})()
