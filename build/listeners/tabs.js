
document.addEventListener('show.tab', function(e){
  let source = e.target;
  let target = document.getElementById(source.dataset.target) || document.querySelector(source.dataset.target);

  if(!target) return false;

  var href = source.getAttribute('href');

  var allTabs = Array.prototype.slice.call(source.parentNode.childNodes)

  target.addEventListener('shown.pane', function tabShown(e) {
    
    allTabs.forEach(node => {
      if(node != source) return node.classList.remove('active');
      return node.classList.add('active');
    })

    source.dispatchEvent(new Event('shown.tab', {bubbles:true, cancelable:true}))
    target.removeEventListener('shown.tab', tabShown)
  })

  
  if(!href || (source.dataset.loaded && !('reload' in source.dataset))) {
    return target.dispatchEvent(new Event('show.pane', {bubbles:true, cancelable:true}))
  }
  
  target.setAttribute('href', href);
  target.dispatchEvent(new Event('load.pane', {bubbles:true, cancelable:true}))

  if(!target.setReload) {
    target.setReload = true;
    console.log(target,'reload listener added')
    target.addEventListener('reload', function reloadTab(e){
      console.log("reload:",e)
      target.dispatchEvent(new Event('load.pane',{bubbles:true, cancelable:true}))
    });
  }

  target.addEventListener('loaded.pane', function tabLoaded(e){
    target.dispatchEvent(new Event('show.pane', {bubbles:true, cancelable:true}))
    target.removeEventListener('loaded.pane', tabLoaded)
  })

    // target.classList.add('active');
});

document.addEventListener('load.pane', function(e){
  let thisPane = e.target;
  let href = thisPane.getAttribute('href');
  if(!href) return false;

  Ajax.html({url:href, method:'get'})
  .then(html => {
    thisPane.classList.remove('error')
    thisPane.innerHTML = html
    thisPane.dispatchEvent(new Event('loaded.pane', {bubbles:true, cancelable:true}));
  })
  .catch(err => {
    thisPane.classList.add('error')
  })

})

document.addEventListener('show.pane', function(e){
  let thisPane = e.target;

  var allPanes = Array.prototype.slice.call(thisPane.parentNode.childNodes)

  allPanes.forEach(node => {
    if(node != thisPane) return node.classList.remove('active');
    return node.classList.add('active');
  });
  
  thisPane.dispatchEvent(new Event('shown.pane'))
  document.dispatchEvent(new Event('scroll'))

});
