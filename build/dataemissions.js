// this code establishes listeners for data events that occur from interaction with form elements

function onXhrContentLoad(e) {
  let source = e.target
  // set local timestamps
  Array.prototype.slice.call(source.querySelectorAll('[data-time]'))
  .map(timestamp => {
    let localdate = new Date(Number(timestamp.dataset.time)).toLocaleString()
    timestamp.innerHTML = localdate
  })

  // load any panels that are active and have hrefs
  Array.prototype.slice.call(source.querySelectorAll('.tab-pane.active[href]'))
  .map(preloadPanel => {

    // add listeners for panels that have href values by default
    if(!preloadPanel.setReload) {
      preloadPanel.setReload = true;
      preloadPanel.addEventListener('reload', function reloadTab(e){
        e.stopPropagation();
        preloadPanel.dispatchEvent(new Event('load.pane', {bubbles:true, cancelable:true}))
      });
    }

    preloadPanel.dispatchEvent(new Event('load.pane', {bubbles:true, cancelable:true}))

    let href = preloadPanel.getAttribute('href');
    Array.prototype.slice.call(document.querySelectorAll('.tab[href="'+href+'"]'))
    .map(triggerTab => {
      triggerTab.dispatchEvent(new Event('shown.tab',{bubbles:true, cancelable:true}))
    })
  })

  if(e.detail && e.detail.getResponseHeader) {
    let headerImage = e.detail.getResponseHeader('X-Header-Image');
    if(headerImage) {
      document.getElementById('header').dispatchEvent(new CustomEvent('replaceImage', {detail:{src:headerImage}, bubbles:true, cancelable:true}))
    }
  }
}

document.addEventListener('replaceImage', function(e){
  let container = e.target;
  let src = e.detail.src;

  container.querySelector('img')

  let newImage = new Image()
  newImage.src = src
  newImage.classList.add('header-image');
  newImage.setAttribute('draggable', false);

  newImage.onload = function(){
    let otherImages = Array.prototype.slice.call(container.querySelectorAll('img'))
    container.appendChild(newImage)

    setTimeout(() => otherImages.map(image=> image.remove()), 1000)

  }
})

document.addEventListener('loaded', onXhrContentLoad);
  // run all necessary scripts on dynamic content here
// data is sniffed at the document level, but reference to the targeted dom will be e.target
document.addEventListener('data', function(e){
  var source = e.target
  var data = e.detail
  var method = source.getAttribute('method')
  // if(method && method=='delete') console.log(data)

  // the data-reaction attribute will specify some predefined behaviors for emitted form data
  if(!source.dataset.reaction) return false;

  if(source.dataset.reaction == 'reload') {
    return source.dispatchEvent(new Event('reload', {bubbles:true, cancelable:true}))
  }

  if(source.dataset.reaction == 'remove') {
    if(!Array.isArray(data)) data = [data]

    data.map(deletable => {
      var elements = Array.prototype.slice.call(document.querySelectorAll("[data-ref='"+deletable.ref.id+"'][data-kind='"+deletable.kind+"']"))
      elements.map(element=>{element.remove()})
    })

    return false;
  }

  // I. fills in input fields with the response data
  if(source.dataset.reaction == 'fill') {
    for(var key in data) {
      var fields = Array.prototype.slice.call(document.getElementsByName(key))
      fields.map(field => {field.value = data[key]})
    }
  }
})

onXhrContentLoad({target:document})
