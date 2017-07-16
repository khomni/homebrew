// DOM manipulation methods
var Ajax = require('../ajax');

module.exports = {
  // given a target node or template, create a copy and append it to the destination node/nodes
  duplicate: function(target,destination) {
    target = document.getElementById(target) || document.querySelector(target)
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

  remove: function(source) {
    target = document.getElementById(source.dataset.target) || source.closest(source.dataset.target)
    target.remove()
  },

  toggle: function(source, className) {
    target = document.getElementById(source.dataset.target) || source.closest(source.dataset.target)
    target.classList.toggle(className)
  },

  //
  tab: function(source) {
    // source.dataset.target
    // source.dataset.container
    var target = document.getElementById(source.dataset.target) || document.querySelector(source.dataset.target);
    if(!target) return false;

    var allPanes = Array.prototype.slice.call(target.parentNode.childNodes)

    allPanes.forEach(node=>{
      if(node != target) return node.classList.remove('active');
      return node.classList.add('active');
    });

    var href = source.getAttribute('href');

    if(href && ('reload' in source.dataset || !source.dataset.loaded)) {
      Ajax.html({url:href, method:'get', headers:{'X-Tab-Content': true}})
      .then(html => {
        target.innerHTML = html
        source.dataset.loaded = true
        document.dispatchEvent(new Event('scroll'))
        source.classList.remove('error')
        target.classList.remove('error')
      })
      .catch(err => {
        source.classList.add('error')
        target.classList.add('error')
      })
    }

    var allTabs = Array.prototype.slice.call(source.parentNode.childNodes)

    allTabs.forEach(node=>{
      if(node != source) return node.classList.remove('active');
      return node.classList.add('active');
    })

    // target.classList.add('active');
  document.dispatchEvent(new Event('scroll'))

  }
}
