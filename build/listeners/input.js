(function(){
  document.addEventListener('input', e => {
    if(e.target.nodeName === 'INPUT') {
      var url = e.target.getAttribute('href')
      if(!url) return false;
      let body = {};
      body[e.target.name] = e.target.value

      if(e.target.searchDelay) clearTimeout(e.target.searchDelay)
      let method = e.target.dataset.method || 'post';
      if(method.toLowerCase() === 'get') url += `?${e.target.name}=${e.target.value}`

      e.target.classList.add('pending')
      e.target.searchDelay = setTimeout(function(){
        e.target.classList.add('loading')

        return Ajax.json({url, method, body})
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
  }, false)

  document.addEventListener('change', e => {
    if(e.target.type == 'file') {
      
    }
  }, false)
})()
