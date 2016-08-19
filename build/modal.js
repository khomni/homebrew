var Promise = require('promise');
var Ajax = require('./ajax');

var Modal = {

  init: function(){
    this.dom = document.getElementById('mainModal');

    this.triggers = document.querySelectorAll('[data-modal]');

      (function(){
        redirect = document.querySelector('.modal-dialog').dataset.redirect
        console.log(redirect)
        if(redirect) {
          document.getElementById('mainModal').addEventListener('hide',function(e){
            window.location = redirect
          })
        }
      })()

    this.dom.addEventListener('hide',function(e){
      redirect = document.querySelector('.modal-dialog').dataset.redirect
      if(redirect){
        window.location = redirect
      }
    })

    for(i=0;i<this.triggers.length;i++){
      this.triggers[i].addEventListener('click',function(e){
        e.preventDefault();
        if(e.target.dataset.modal == 'dismiss') {
          Modal.hideModal();
        } else {
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
        }
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
        Modal.dom.innerHTML = ""
        var newdiv = document.createElement('div');
        newdiv.innerHTML = text;
        Modal.dom.appendChild(newdiv.childNodes[0]);
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
