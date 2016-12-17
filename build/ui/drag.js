// Drag objects can be clicked and dragged around the document
var Ticker = require('../ticks');

var drag = {
  dragging: null,
  // set up the body listeners
  init: function(){

    var dragUpdate = new Ticker()
    // move a dragging element if dragging
    document.addEventListener('mousemove', e => {
      if(!drag.dragging || !drag.dragging.elem) return true; // nothing to drag, do nothing

      dragUpdate.onTick(function(){
        if(!drag.dragging) return false; // mouse has been released before the next frame has been obtained

        // Drag Logic

        // get dimensions from the center of the handle
        var handleRect = drag.dragging.handle.getBoundingClientRect();
        handleRect.width = handleRect.right - handleRect.left;
        handleRect.height = handleRect.bottom - handleRect.top;
        handleRect.offsetTop = drag.dragging.handle.offsetTop
        handleRect.offsetLeft = drag.dragging.handle.offsetLeft

        // set top-left coordinate of the entire element based on the offset of the center of the handle
        // mouse[x,y] - handle[midY,midY] - hanlde[offsetX,offsetY]
        drag.dragging.elem.style.left = (e.clientX - handleRect.width/2 - handleRect.offsetLeft)+"px"
        drag.dragging.elem.style.top = (e.clientY - handleRect.height/2 - handleRect.offsetTop)+"px"
      })
      return false;
    })

    // release the dragging element
    document.addEventListener('mouseup', e => {
      drag.dragging = null;
      return true;
    })

  }
}

function Draggable(elem,handle) {
  var thisDraggable = this
  // initialize position of element
  elem.classList.add('draggable');

  // set internal varialbes
  thisDraggable.handle = handle || elem.querySelector('.handle') || elem

  // forces the draggable object to center itself in the viewport
  this.center = function(){

  }

  // set up listeners on the drag element
  // 1) mousedown to start the drag
  // the listeners for moving and mouseup are handled at the document level
  thisDraggable.handle.addEventListener('mousedown', e => {
    if(e.which != 1) return true;
    thisDraggable.dragging = true;
    drag.dragging = {
      elem: elem,
      handle: thisDraggable.handle,
    }
    return true;
  })

}

module.exports = drag
module.exports.Draggable = Draggable
