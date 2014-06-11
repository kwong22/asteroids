/*
 * Thanks to https://github.com/gabrielecirulli/2048
 * for this input code
 */

function InputManager() {
    this.events = {};

    this.eventTouchstart = 'touchstart';
    this.eventTouchmove = 'touchmove';
    this.eventTouchend = 'touchend';

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
    var gameContainer = document.getElementsByClassName("game-container")[0];

    gameContainer.addEventListener(this.eventTouchstart, function(event) {
	if (event.targetTouches > 1) {
	    return; // Ignore if touching with more than 1 finger
	}
	
	touchStartClientX = event.touches[0].clientX;
	touchStartClientY = event.touches[0].clientY;

	self.emit('touchStart', new Position(touchStartClientX, touchStartClientY));
	
	event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchmove, function(event) {
	touchClientX = event.touches[0].clientX;
	touchClientY = event.touches[0].clientY;

	self.emit('touchMove', new Position(touchClientX, touchClientY));

	event.preventDefault();
    });

    gameContainer.addEventListener(this.eventTouchend, function(event) {
	if (event.targetTouches > 0) {
	    return; // Ignore if still touching with one or more fingers
	}

	var touchEndClientX, touchEndClientY;
	
	touchEndClientX = event.changedTouches[0].clientX;
	touchEndClientY = event.changedTouches[0].clientY;

	self.emit('touchEnd', new Position(touchEndClientX, touchEndClientY));
    });
};
