/*
 * Thanks to https://github.com/gabrielecirulli/2048
 * for this input code
 */

function InputManager() {
    this.events = {};

    if (window.navigator.msPointerEnabled) {
	this.eventTouchstart = 'MSPointerDown';
	this.eventTouchmove = 'MSPointerMove';
	this.eventTouchend = 'MSPointerUp';
    } else {
	this.eventTouchstart = 'touchstart';
	this.eventTouchmove = 'touchmove';
	this.eventTouchend = 'touchend';
    }

    this.listen();
}

InputManager.prototype.on = function(event, callback) {
    if (!this.events[event]) {
	this.events[event] = [];
    }
    this.events[event].push(callback);
};

InputManager.prototype.emit = function(event, data) {
    var callbacks = this.events[event];
    if (callbacks) {
	callbacks.forEach(function(callback) {
	    callback(data);
	});
    }
};

InputManager.prototype.listen = function() {
    var self = this;

    // Respond to swipe events
    var touchStartClientX, touchStartClientY;
    var gameCanvas = document.getElementById("game-canvas");

    gameCanvas.addEventListener(this.eventTouchstart, function(event) {
	if ((!window.navigator.msPointerEnabled && event.touches.length > 1) || event.targetTouches > 1) {
	    return; // Ignore if touching with more than 1 finger
	}

	if (window.navigator.msPointerEnabled) {
	    touchStartClientX = event.pageX;
	    touchStartClientY = event.pageY;
	} else {	
	    touchStartClientX = event.touches[0].clientX;
	    touchStartClientY = event.touches[0].clientY;
	}

	self.emit('touchStart', new Position(touchStartClientX, touchStartClientY));
	
	event.preventDefault();
    });

    gameCanvas.addEventListener(this.eventTouchmove, function(event) {
	var touchClientX, touchClientY;

	if (window.navigator.msPointerEnabled) {
	    touchClientX = event.pageX;
	    touchClientY = event.pageY;
	} else {
	    touchClientX = event.touches[0].clientX;
	    touchClientY = event.touches[0].clientY;
	}

	self.emit('touchMove', new Position(touchClientX, touchClientY));

	event.preventDefault();
    });

    gameCanvas.addEventListener(this.eventTouchend, function(event) {
	if ((!window.navigator.msPointerEnabled && event.touches.length > 0) || event.targetTouches > 0) {
	    return; // Ignore if still touching with one or more fingers
	}

	var touchEndClientX, touchEndClientY;

	if (window.navigator.msPointerEnabled) {
	    touchEndClientX = event.pageX;
	    touchEndClientY = event.pageY;
	} else {
	    touchEndClientX = event.changedTouches[0].clientX;
	    touchEndClientY = event.changedTouches[0].clientY;
	}

	self.emit('touchEnd', new Position(touchEndClientX, touchEndClientY));
    });
};
