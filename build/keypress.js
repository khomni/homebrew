var Ajax = require('./ajax.js');
var Modal = require('./modal');

// various frontend scripts for keypresses

(function(){
  document.addEventListener('input', e => {
    if(e.target.nodeName === 'INPUT') {
      var url = e.target.getAttribute('href')
      if(!url) return false;
      var body = {}
      body[e.target.name] = e.target.value

      if(e.target.searchDelay) clearTimeout(e.target.searchDelay)

      e.target.classList.add('pending')
      e.target.searchDelay = setTimeout(function(){
        e.target.classList.add('loading')
        return Ajax.json({url:url, method:'post', body: body})
        .then(response => {
          clearTimeout(e.target.searchDelay)
          var dataEvent = new CustomEvent('data',{detail:response,bubbles:true})
          e.target.dispatchEvent(dataEvent)
          e.target.classList.remove('pending','loading')
        })
        .catch(console.error)
      },1000)

    }
    return false
  })

  document.addEventListener('keydown', e => {
    // ESC handler
    if(e.which === 27) {
      document.querySelector('.modal:last-child').modal.remove()
      return true;
    }

    // TAB handler
    if(e.which === 9) {
      return true;
    }
    return true;
  })




})()
