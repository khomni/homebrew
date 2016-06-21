var DataBar = function(node) {
  this.dom = node;
  this.id = node.id
  this.max = parseInt(node.dataset.max);
  this.value = parseInt(node.dataset.value);
  this.initialize = function(){
    let thisBar = this
    thisBar.updateWidth();
    thisBar.dom.addEventListener('update',function(e){ //custom event for updating a bar
      thisBar.set(e.detail);
      thisBar.updateWidth();
    },false)
  }

  this.updateWidth = function(){
    let node = this.dom;
    let max = this.max
    let value = this.value
    node.style.width = Math.abs(value)/max * 100 + "%"

    if(value > max) {
      node.classList.add("overflow")
    }
    else {
      node.classList.remove("overflow")
    }

    if(value/max <= 0.5) {
      node.classList.add("below-half")
    }
    else {
      node.classList.remove("below-half")
    }

    if(value/max < 0) {
      node.classList.add("negative")
    }
    else node.classList.remove("negative")

  }

  this.set = function(value) {
    let node = this.dom;
    this.value = parseInt(value)
    node.dataset.value = this.value
    node.childNodes[0].innerHTML = value
  }
}

var Bars = []

let allBars = document.querySelectorAll('[data-display="bar"]');

for(i=0;i<allBars.length;i++) {
  let newBar = new DataBar(allBars[i])
  newBar.initialize();
  Bars.push(newBar);
}

module.exports = Bars;
