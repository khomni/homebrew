// a single event listener for all click events
var dom = require('./dom.js');

(function(){
  document.addEventListener('click', e => {
    var source = e.target
    if(!('click' in source.dataset)) source = source.closest('[data-click]')
    if(!source) return true;
    var clickAction = source.dataset.click
    if(!clickAction) return true;
    e.preventDefault();
    // duplicate an element or template in the dom and append it to the 'destination'
    if(clickAction == 'duplicate' && source.dataset.target && source.dataset.destination) {
      return dom.duplicate(source.dataset.target, source.dataset.destination)
    }

    // removes the targeted element by id, or finds the closest parent that matches the target selector
    if(clickAction == 'remove' && source.dataset.target) {
      return dom.remove(source)
    }

    // adds the 'collapsed' class to the target element or the closest parent with the target selector
    if(clickAction == 'collapse' && source.dataset.target) {
      return dom.toggle(source, 'collapsed')
    }

    if(clickAction == 'tab' && source.dataset.target) {
      // let href = source.getAttribute('href')
      // if(href) history.pushState({href: href}, null, href)
      return source.dispatchEvent(new Event('show.tab', {bubbles:true, cancelable:true}))
      // return dom.tab(source)
    }

  })

})()
