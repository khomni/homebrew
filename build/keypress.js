var Ajax = require('./ajax.js');
var Modal = require('./modal');

// various frontend scripts for keypresses

(function(){

  document.addEventListener('keydown', e => {
    // ESC handler
    if(e.which === 27) {
      var topModal = document.querySelector('.modal:last-child')
      if(topModal && topModal.modal) topModal.modal.remove()
      return true;
    }

    // TAB handler
    if(e.which === 9) {
      return true;
    }
    return true;
  })




})()
