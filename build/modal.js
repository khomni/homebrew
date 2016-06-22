var Promise = require('promise');
var Ajax = require('./ajax');

var Modal = {

  init: function(){
    this.dom = document.getElementById('mainModal');
    this.triggers = document.querySelectorAll('[data-modal]');
    for(i=0;i<this.triggers.length;i++){
      this.triggers[i].addEventListener('click',function(e){
        e.preventDefault();
        Modal.loadModal(this.dataset.modal,function(err){
          if(!err) {
            Modal.showModal();
            var firstInput = Modal.dom.getElementsByTagName('input')[0]
            if(firstInput) {
              firstInput.focus();
              firstInput.select();
            }
          }
        });
      },true)
    }
    document.body.addEventListener('mousedown',function(e){
      if(e.target.id === 'mainModal') {
        Modal.hideModal();
      }
    })
  },

  loadModal: function(url,callback) {
    console.log(Ajax)
    Ajax.html({method:"GET",url:url})
      .then(text => {
        Modal.dom.innerHTML = text;
        return callback();
      })
      .catch(err =>{
        return callback(err);
      })
  },

  createModal: function(html,callback) {
    Modal.dom.innerHTML = html;
    Modal.showModal();
  },

  showModal: function(){
    Modal.dom.classList.add('open');
    document.body.classList.add('modal-open');
  },

  hideModal: function(){
    Modal.dom.classList.remove('open');
    document.body.classList.remove('modal-open')
  }

};

module.exports = Modal;
