(function(){
	var Ticker = require('../ticks');
	var Ajax = require('../ajax');

	var onView = Array.prototype.slice.call(document.querySelectorAll('[data-visible]'));

	var scrollUpdate = new Ticker()
	// data is sniffed at the document level, but reference to the targeted dom will be e.target

	document.addEventListener('scroll',function(e){
		if(onView.length < 1) return true;

		scrollUpdate.onTick(function(){
			// get the range of y pixels on screen
			var visible = {
				top: window.scrollY,
				bottom: window.scrollY + window.innerHeight
			}
			// for each viewable element, check to see if any part of it is on screen
			onView.map((elem,i) => {
				if(!elem.offsetParent) return false; // do not trigger if element is not visible
				var rect = elem.getBoundingClientRect();
				if(rect.top < window.innerHeight || rect.bottom < window.scrollY) {
					onView.splice(i,1);
					// load ajax content
					if(elem.getAttribute('href')) {
						elem.classList.add('loading')
						Ajax.html({method:'get', url: elem.getAttribute('href')})
						.then(html => {
							elem.innerHTML = html
							elem.classList.remove('loading')
						})
						.catch(console.error)
					}
					// remove the triggered view event from the list
				}
			})

		});
	})
	// trigger a scroll event to make sure anything in view gets loaded automatically
	document.dispatchEvent(new Event('scroll'))
})()
