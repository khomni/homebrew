// this code establishes listeners for data events that occur from interaction with form elements

(function(){
  // data is sniffed at the document level, but reference to the targeted dom will be e.target
  document.addEventListener('data', function(e){
    console.log(e)
    var source = e.target
    var data = e.detail
    var method = source.getAttribute('method')
    // if(method && method=='delete') console.log(data)

    // the data-reaction attribute will specify some predefined behaviors for emitted form data
    if(!source.dataset.reaction) return false;

    if(source.dataset.reaction == 'redirect') {
      console.log('redirect with data:',data)
      if(data.redirect) return window.location = data.redirect
      return window.location.reload()
    }

    if(source.dataset.reaction == 'remove') {
      if(!Array.isArray(data)) data = [data]

      console.log(data)
      data.map(deletable => {
        var elements = Array.prototype.slice.call(document.querySelectorAll("[data-ref='"+deletable.ref.id+"'][data-kind='"+deletable.kind+"']"))
        console.log(elements)
        elements.map(element=>{element.remove()})
      })

      return false;
    }

    // I. fills in input fields with the response data
    if(source.dataset.reaction == 'fill') {
      console.log(data)
      for(var key in data) {
        var fields = Array.prototype.slice.call(document.getElementsByName(key))
        fields.map(field => {field.value = data[key]})
      }
    }

  })
})()
