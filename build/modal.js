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
            if(firstInput) firstInput.focus().select();
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
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
     if (xhr.readyState == 4 && xhr.status == 200) {
      Modal.dom.innerHTML = xhr.responseText;
      callback();
     }
     else {
       callback(new Error(xhr))
     }
    }
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-type', 'text/html');
    xhr.send();
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
