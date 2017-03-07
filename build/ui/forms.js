module.exports = {
  // given a target node or template, create a copy and append it to the destination node/nodes
  duplicate: function(target,destination) {
    target = document.getElementById(target) || document.querySelector(target)
    var destination = e.target.dataset.destination
    destination = document.getElementById(destination) || document.querySelector(destination)
    if(!target || !destination) return false

    if("content" in target) { // target is a template, import the node
      var duplicate = document.importNode(target.content,true)
    } else {
      var duplicate = document.createElement('div')
      duplicate.innerHTML = target.outerHTML
    }

    Array.prototype.slice.call(duplicate.childNodes).map(node => {destination.appendChild(node)})
  },
  
  remove: function(target) {
    target = document.getElementById(target) || source.closest(target)
    target.remove()
  },

  collapse: function(target) {
    target = document.getElementById(target) || source.closest(target)
    target.classList.toggle('collapsed')
  },
}
