function Map() {
    this.map_ = null;
    this.asteroids_ = [];
    this.blasts_ = [];
    this.width_ = 300;
    this.height_ = 400;
    this.player_ = null;

    this.chargeThresholdTime = 1000;
    this.startChargeTime = 0;
    this.isCharging = false;
    this.isCharged = false;

    this.startTime = 0;
    this.currentTime = 0;
    this.previousTime = 0;

    this.isLoaded = false;

    this.loadMap = function() {
	this.map_ = null;

	// Load in the map
	var playerX = this.width_ / 2;
	var playerY = this.height_ / 2;
	var shieldRadius = 16;
	this.player_ = new Player(new Position(playerX, playerY), shieldRadius, 3 * Math.PI / 2);

	// Test objects
	this.asteroids_.push(new Asteroid(new Position(10,10), new PolarVector(2, Math.PI / 4), 8, 2));

	this.startTime = (new Date).getTime();
	this.currentTime = (new Date).getTime();
	this.previousTime = (new Date).getTime();
	
	this.isLoaded = true;
    }

    this.aimBlaster = function(location) {
	this.updateBlasterDirection(location);
	if (!this.isCharging) {
	    this.isCharging = true;
	    this.startChargeTime = (new Date).getTime();
	}
    }

    this.updateBlasterDirection = function(location) {
	var dx = location.x - this.player_.x;
	var dy = location.y - this.player_.y;

	if (dx > 0) {
            var theta = (Math.atan(dy / dx)) % (2 * Math.PI); // The codomain of atan is -pi/2 to pi/2
	} else {
	    theta = (Math.PI + Math.atan(dy / dx)) % (2 * Math.PI);
	}

	this.player_.direction = theta;
    }

    this.createBlast = function(location) {
	this.updateBlasterDirection(location);
	this.blasts_.push(new Blast(new Position(this.player_.x, this.player_.y),
				    this.player_.direction,
				    this.isCharged));
	this.isCharged = false;
	this.isCharging = false;
	this.startChargeTime = 0;
    }

    this.update = function() {
	
	this.currentTime = (new Date).getTime();

	if (this.isCharging) {
	    if (this.startChargeTime != 0) {
		if (this.currentTime - this.startChargeTime >= this.chargeThresholdTime) {
		    this.isCharged = true;
		    this.startChargeTime = 0;
		}
	    }
	}

	for (var i in this.asteroids_) {
	    var ast = this.asteroids_[i];
	    if (ast.y + ast.radius < 0) {
		ast.y = this.height_ + ast.radius;
	    } else if (ast.y - ast.radius > this.height_) {
		ast.y = -1 * ast.radius;
	    }
	    if (ast.x + ast.radius < 0) {
		ast.x = this.width_ + ast.radius;
	    } else if (ast.x - ast.radius > this.width_) {
		ast.x = -1 * ast.radius;
	    }
	    ast.updatePosition();
	}

	for (var j in this.blasts_) {
	    var b = this.blasts_[j];
	    for (var jj in this.asteroids_) {
		var ast = this.asteroids_[jj];
		if (distanceBetween(b.x, b.y, ast.x, ast.y) < b.radius + ast.radius) {
		    this.blasts_.splice(j, 1);
		    this.asteroids_.splice(jj, 1);
		}
	    }
	    if ((b.y + b.radius < 0) ||
		(b.y - b.radius > this.height_) ||
		(b.x + b.radius < 0) ||
		(b.x - b.radius > this.width_)) {
		this.blasts_.splice(j, 1);
	    }
	    b.updatePosition();
	}

	this.previousTime = this.currentTime;
    }

    this.draw = function(canvasContext) {
	// Draw background
	canvasContext.fillStyle = '#333';
	canvasContext.fillRect(0, 0, this.width_, this.height_);

	// Draw player
	canvasContext.fillStyle = '#369';
	canvasContext.fillRect(this.player_.x, this.player_.y, 8, 8);

	// Draw asteroids
	for (var i in this.asteroids_) {
	    var ast = this.asteroids_[i];
	    canvasContext.beginPath();
	    canvasContext.arc(ast.x, ast.y, ast.radius, 0, 2 * Math.PI, true);
	    canvasContext.fillStyle = '#777';
	    canvasContext.fill();
	}

	// Draw blasts
	for (var j in this.blasts_) {
	    var b = this.blasts_[j];
	    canvasContext.beginPath();
	    canvasContext.arc(b.x, b.y, b.radius, 0, 2 * Math.PI, true);
	    canvasContext.fillStyle = '#f90';
	    canvasContext.fill();
	}

	// Draw charge meter
	var outerOffset = 8;
	var innerOffset = 4;
	var borderWidth = 2;
	var barHeight = 16;
	var barLength = 100;
	var outerWidth = borderWidth + 2 * innerOffset + barLength;
	var outerHeight = borderWidth + 2 * innerOffset + barHeight;

	// Draw the outer border
	canvasContext.lineWidth = borderWidth;
	canvasContext.strokeStyle = '#fff';
	canvasContext.strokeRect(outerOffset - 0.5 * borderWidth,
				 this.height_ - outerOffset - outerHeight + 0.5 * borderWidth,
				 outerWidth,
				 outerHeight);

	// Draw the inner bar if charging or charged
	if (this.isCharging) {
	    if (this.isCharged) {
		canvasContext.fillStyle = '#fff';
		canvasContext.fillRect(outerOffset + innerOffset,
				       this.height_ - outerOffset - innerOffset - barHeight,
				       barLength,
				       barHeight);
	    } else {
		var amountFilled = (this.currentTime - this.startChargeTime) / this.chargeThresholdTime;
		amountFilled = (amountFilled > 1) ? 1 : amountFilled;
		canvasContext.fillStyle = '#fff';
		canvasContext.fillRect(outerOffset + innerOffset,
				       this.height_ - outerOffset - innerOffset - barHeight,
				       barLength * amountFilled,
				       barHeight);
	    }
	}
    }
}
