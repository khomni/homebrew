// Drag objects can be clicked and dragged around the document
var Ticker = require('../ticks');

var drag = {
  dragging: null,
  // set up the body listeners
  init: function(){

    var dragUpdate = new Ticker()

    let currentX, currentY, lastKnownX, lastKnownY, reset
    // move a dragging element if dragging
    document.addEventListener('mousemove', e => {
      if(!drag.dragging || !drag.dragging.elem) return true; // nothing to drag, do nothing
      e.preventDefault();

      let element = drag.dragging.elem
      dragUpdate.onTick(() => {
        if(!drag.dragging) return false; // mouse has been released before the next frame has been obtained
        clearTimeout(reset)
        reset = setTimeout(()=>{
          lastKnownX = lastKnownY = null
          element.classList.remove('drag-x','drag-y')
        },50)
        // Drag Logic

        // get dimensions from the center of the handle
        let handleRect = drag.dragging.handle.getBoundingClientRect();
        handleRect.width = handleRect.right - handleRect.left;
        handleRect.height = handleRect.bottom - handleRect.top;
        handleRect.offsetTop = drag.dragging.handle.offsetTop
        handleRect.offsetLeft = drag.dragging.handle.offsetLeft

        let noHandle = drag.dragging.elem.isSameNode(drag.dragging.handle)

        currentX = Math.max(0,(e.clientX - handleRect.width/2 - (noHandle ? 0 : handleRect.offsetLeft)))
        currentY = Math.max(0,(e.clientY - handleRect.height/2 - (noHandle ? 0 : handleRect.offsetTop)))

        let speedX = Math.abs(currentX - (lastKnownX||currentX))
        let speedY = Math.abs(currentY - (lastKnownY||currentY))

        if(speedX > (speedY * 2) && speedX > 10) drag.dragging.elem.classList.add('drag-x');
        else drag.dragging.elem.classList.remove('drag-x')
        if(speedY > (speedX * 2) && speedY > 10) drag.dragging.elem.classList.add('drag-y');
        else drag.dragging.elem.classList.remove('drag-y')

        lastKnownX = currentX
        lastKnownY = currentY

        // set top-left coordinate of the entire element based on the offset of the center of the handle
        // mouse[x,y] - handle[midY,midY] - hanlde[offsetX,offsetY]
        drag.dragging.elem.style.left = currentX+"px"
        drag.dragging.elem.style.top = currentY+"px"
      })
      return false;
    },true)

    // release the dragging element
    document.addEventListener('mouseup', e => {
      drag.dragging = null;
      return true;
    },true)

  }
}

function Draggable(elem,handle) {
  var thisDraggable = this
  // initialize position of element
  elem.classList.add('draggable');

  // set internal varialbes
  thisDraggable.handle = handle || elem.querySelector('.handle') || elem

  // set up listeners on the drag element
  // 1) mousedown to start the drag
  // the listeners for moving and mouseup are handled at the document level
  thisDraggable.handle.addEventListener('mousedown', e => {
    // intercept clicks on elements that shouldn't start a drag
    let intercept = e.target.closest('button,input,select,textarea')
    if(intercept) return true;

    if(e.which != 1) return true;
    thisDraggable.dragging = true;
    drag.dragging = {
      elem: elem,
      handle: thisDraggable.handle,
    }
    return true;
  }, true)

}

module.exports = drag
module.exports.Draggable = Draggable
