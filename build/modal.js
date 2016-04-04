var Modal = {
  init: function(){
    this.dom = document.getElementById('mainModal');
    this.triggers = document.querySelectorAll('[data-modal]');
    for(i=0;i<this.triggers.length;i++){
      this.triggers[i].addEventListener('click',function(e){
        e.preventDefault();
        console.log(this);
        Modal.loadModal(this.dataset.modal,function(){
          Modal.showModal();
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
     }
    }
    xhr.open("GET", url, true);
    xhr.setRequestHeader('Content-type', 'text/html');
    xhr.send();
    callback();
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
