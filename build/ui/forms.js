(function(){
  // form elements that can be clicked on
  document.addEventListener('click', e => {
    var clickAction = e.target.dataset.click
    if(!clickAction) return true; // do not interrupt the click behavior

    e.preventDefault();
    var target = e.target.dataset.target
    // duplicate
    if(clickAction=='duplicate' && target) {
      target = document.getElementById(target) || document.querySelector(target)
      if(!target) return false
      var destination = e.target.dataset.destination
      destination = document.getElementById(destination) || document.querySelector(destination)

      if("content" in target) { // target is a template, import the node
        var duplicate = document.importNode(target.content,true)
      } else {
        var duplicate = document.createElement('div')
        duplicate.innerHTML = target.outerHTML
      }

      Array.prototype.slice.call(duplicate.childNodes).map(node => {destination.appendChild(node)})
    }

    if(clickAction=='remove' && target) {
      target = document.getElementById(target) || document.querySelector(target)
      target.remove()
    }


    return false

  })

  // ajax searching from input event
  // after a brief delay, sends a request to the input's HREF attribute using the input name and value as the request body
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
})()
