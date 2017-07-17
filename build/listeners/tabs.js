'use strict';

const Anim = require('../extensions/anim');
const Effects = require('../effects');
const Modal = require('../modal');

window.addEventListener('popstate', e => {
  if(!e.state.href) return true;
  let panel = document.getElementById(e.state.target) || document.getElementById('main');
  let triggerTab = document.querySelector('[href="'+e.state.href+'"]')
  panel.dispatchEvent(new CustomEvent('load.pane', {detail: {href:e.state.href}, bubbles:true, cancelable:true}))
  if(triggerTab) triggerTab.dispatchEvent(new Event('shown.tab',{bubbles:true, cancelable:true}))
  e.preventDefault();
  return false;
});

document.addEventListener('show.tab', function(e) {
  let source = e.target;
  let target = document.getElementById(source.dataset.target) || document.querySelector(source.dataset.target) || source.closest('.tab-pane')
  let alternate = e.detail.alt
  
  if(!target && !alternate) return false;

  var href = source.getAttribute('href');


  target.addEventListener('shown.pane', function tabShown(e) {

    source.dispatchEvent(new Event('shown.tab', {bubbles:true, cancelable:true}))
    target.removeEventListener('shown.tab', tabShown)
  })

  
  if(!href || (source.dataset.loaded && !('reload' in source.dataset))) {
    return target.dispatchEvent(new Event('show.pane', {bubbles:true, cancelable:true}))
  }

  // if(alternate) Modal.createModal
  
  // state is pushed here instead of the load so the panel can be loaded and reloaded without adding additional history states
  target.dispatchEvent(new CustomEvent('load.pane', {detail: {href: href}, bubbles:true, cancelable:true}))

  if(!target.setReload) {
    target.setReload = true;
    target.addEventListener('reload', function reloadTab(e){
      e.stopPropagation();
      target.dispatchEvent(new Event('load.pane', {bubbles:true, cancelable:true}))
    });
  }

  target.addEventListener('loaded', function tabLoaded(e){
    history.pushState({target: target.id, href: e.detail.responseURL}, null, e.detail.responseURL)
    target.classList.remove('loading');
    // exampine the tab's XHR response
    let xhr = e.detail;
    // remove this listener after it fires
    target.removeEventListener('loaded', tabLoaded)
  
    source.classList.remove('error','obscured');
    if(xhr.status >= 500 && xhr.status < 600) return source.classList.add('error');
    if(xhr.status >= 400 && xhr.status < 500) return source.classList.add('obscured');

    target.dispatchEvent(new Event('show.pane', {bubbles:true, cancelable:true}))
  })

    // target.classList.add('active');
});

document.addEventListener('shown.tab', function(e){
  let source = e.target
  var allTabs = Array.prototype.slice.call(source.parentNode.childNodes)

  allTabs.forEach(node => {
    if(node != source) return node.classList.remove('active');
  })

  return source.classList.add('active');
})  

document.addEventListener('load.pane', function(e){
  let thisPane = e.target;
  let href = (e.detail&&e.detail.href) || thisPane.getAttribute('href');
  if(!href) return false;
  thisPane.setAttribute('href', href);
  thisPane.classList.add('loading');

  Ajax.fetch({url:href, method:'get', headers:{'Accept': 'text/html', 'X-Tab-Content': true}})
  .then(xhr => {
    let redirect = xhr.getResponseHeader('X-Redirect')
    if(redirect) {
      return thisPane.dispatchEvent(new CustomEvent('load.pane', {detail: {href:redirect}, bubbles:true, cancelable:true}));
    }
    // send the xhr resonse to the tab
    let html = xhr.responseText
    let title = xhr.getResponseHeader('X-Page-Title');
    if(title) document.getElementById('pageTitle').innerHTML = decodeURIComponent(title);

    if(xhr.getResponseHeader('X-Modal')) return Modal.methods.createModal(html);

    thisPane.classList.remove('error');
    thisPane.innerHTML = html;
    if(!xhr.responseURL) xhr.responseURL = href
    thisPane.dispatchEvent(new CustomEvent('loaded', {detail: xhr, bubbles:true, cancelable:true}));
  })
  .catch(err => {
    console.error(err);
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
  
  thisPane.dispatchEvent(new Event('shown.pane'));

  // SCROLL BACK
  // when a tab loads, if its offest is above the top of the screen, the window should smoothly scroll up until the top is visible;
  let target = thisPane.getBoundingClientRect().top + window.scrollY
  // target scroll destination is above
  Anim.scrollTo(target, {down:false})
  document.dispatchEvent(new Event('scroll'))
});
