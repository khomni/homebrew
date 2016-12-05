var Promise = require('bluebird');
var Ajax = require('./ajax');

var Modal = {

  init: function(){
    this.dom = document.getElementById('mainModal');

    this.triggers = document.querySelectorAll('a[data-response="modal"]');

    (function(){
      redirect = document.querySelector('.modal-dialog').dataset.redirect
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
        if(this.dataset.response == 'dismiss') return Modal.hideModal
        if(!this.getAttribute('href')) return false;

        Modal.loadModal(this.getAttribute('href'),function(err){
          if(err) return console.error(err)
          Modal.showModal();
          var firstInput = Modal.dom.getElementsByTagName('input')[0]
          if(firstInput) {
            firstInput.focus();
            firstInput.select();
          }
        });
      },true)
    }

    document.body.addEventListener('mousedown',function(e){
      if(e.target.id === 'mainModal') Modal.hideModal();
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
