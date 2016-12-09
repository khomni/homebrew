(function(){
  document.addEventListener('data',function(e){
    var source = e.target
    var data = e.detail
    var method = source.getAttribute('method')
    if(method && method=='delete') console.log(data)

  })
})()
