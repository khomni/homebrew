(function(){
	var Ticker = require('../ticks');
	var Ajax = require('../ajax');

	// needs revision
	// var onView = Array.prototype.slice.call(document.querySelectorAll('[data-visible]'));

	var scrollUpdate = new Ticker()
	// data is sniffed at the document level, but reference to the targeted dom will be e.target

	let lastKnownPosition, currentPosition, speed, isBlurred, reset
	document.addEventListener('scroll', e => {
		scrollUpdate.onTick(() => {
			clearTimeout(reset);
			reset = setTimeout(() => {
				lastKnownPosition = undefined;
				document.body.classList.remove('scroll-blur')
			}, 50);

			currentPosition = window.scrollY
			speed = Math.abs(currentPosition - (lastKnownPosition||currentPosition))

			if(speed > 10) {
				if(!isBlurred) {
					isBlurred = true;
					document.body.classList.add('scroll-blur');
				}
			}
			else {
				isBlurred = false;
				document.body.classList.remove('scroll-blur');
			}

			lastKnownPosition = currentPosition
			// get the range of y pixels on screen
			var visible = {
				top: window.scrollY,
				bottom: window.scrollY + window.innerHeight
			}
		});
	})
	// trigger a scroll event to make sure anything in view gets loaded automatically
	document.dispatchEvent(new Event('scroll'))
})()
