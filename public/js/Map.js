function Map() {
    this.map_ = null;
    this.score = 0;
    this.asteroids_ = [];
    this.blasts_ = [];
    this.width_ = 300;
    this.height_ = 400;
    this.player_ = null;

    this.chargeThresholdTime = 1000;
    this.startChargeTime = 0;
    this.isCharging = false;
    this.isCharged = false;

    this.currentHeat = 0;
    this.blastHeat = 20;
    this.maxHeat = 100;
    this.cooldownRate = 0.5;
    this.isOverheated = false;
    this.overheatDuration = 2000;
    this.startOverheatTime = 0;

    this.startTime = 0;
    this.currentTime = 0;
    this.previousTime = 0;

    this.gameOver = false;

    this.isLoaded = false;

    this.loadMap = function() {

	this.map_ = null;

	this.score = 0;

	// Load in the map
	var playerX = this.width_ / 2;
	var playerY = this.height_ / 2;
	var playerRadius = 12;
	var shieldRadius = 32;
	var shieldHealth = 8;
	this.player_ = new Player(new Position(playerX, playerY), playerRadius, shieldRadius, shieldHealth, 3 * Math.PI / 2);

	// Test asteroids
	this.asteroids_.push(new Asteroid(new Position(10,10), new PolarVector(2, Math.PI / 4), 12, 2));
	this.asteroids_.push(new Asteroid(new Position(30,30), new PolarVector(2, Math.PI / 3), 12, 2));
	this.asteroids_.push(new Asteroid(new Position(50,50), new PolarVector(2, Math.PI / 2), 12, 2));
	this.asteroids_.push(new Asteroid(new Position(70,70), new PolarVector(2, Math.PI / 1), 12, 2));
	this.asteroids_.push(new Asteroid(new Position(90,90), new PolarVector(2, Math.PI * 3 / 4), 12, 2));

	this.startChargeTime = 0;
	this.isCharging = false;
	this.isCharged = false;

	this.currentHeat = 0;
	this.isOverheated = false;
	this.startOverheatTime = 0;

	this.startTime = (new Date).getTime();
	this.currentTime = (new Date).getTime();
	this.previousTime = (new Date).getTime();
	
	this.gameOver = false;
	
	this.isLoaded = true;
    }

    this.aimBlaster = function(location) {
	this.updateBlasterDirection(location);
	if (!this.isCharging && !this.isOverheated) {
	    this.isCharging = true;
	    this.startChargeTime = (new Date).getTime();
	}
    }

    this.updateBlasterDirection = function(location) {
	var dx = location.x - this.player_.x;
	var dy = location.y - this.player_.y;
	this.player_.direction = determineAngle(dx, dy);
    }

    this.createBlast = function(location) {
	this.updateBlasterDirection(location);

	if (!this.isOverheated) {
	    this.blasts_.push(new Blast(new Position(this.player_.x, this.player_.y), this.player_.direction, this.isCharged));

	    this.currentHeat += this.blastHeat;
	    if (this.currentHeat > this.maxHeat) {
		this.currentHeat = this.maxHeat;
		this.isOverheated = true;
		this.startOverheatTime = (new Date).getTime();
	    }
	}

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

	if (this.isOverheated) {
	    if (!(this.currentTime - this.startOverheatTime < this.overheatDuration)) {
		if (this.currentHeat >= this.cooldownRate) {
		    this.currentHeat -= this.cooldownRate;
		} else {
		    this.currentHeat = 0;
		    this.isOverheated = false;
		    this.startOverheatTime = 0;
		}
	    }
	} else if (this.currentHeat >= this.cooldownRate) {
	    this.currentHeat -= this.cooldownRate;
	} else {
	    this.currentHeat = 0;
	}

	for (var i in this.asteroids_) {
	    var a = this.asteroids_[i];

	    // Check for collisions with shield
	    if (this.player_.isShielded) {
		if (distanceBetween(this.player_.x, this.player_.y, a.x, a.y) < this.player_.shieldRadius + a.radius) {
		    var dx = a.x - this.player_.x;
		    var dy = a.y - this.player_.y;
		    var r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		    var theta = determineAngle(dx, dy);
		    var n = new PolarVector(r, theta);
		    var t = new PolarVector(r, (theta + Math.PI / 2) % (2 * Math.PI));
		    var vn = dotProduct(a.v, n) / n.r;
		    var vt = dotProduct(a.v, t) / t.r;
		    var dampingFactor = 3 / 4;
		    var newv = addVectors(new PolarVector(vn * Math.sqrt(dampingFactor), (n.theta + Math.PI) % (2 * Math.PI)), new PolarVector(vt * Math.sqrt(dampingFactor), t.theta));
		    a.v = newv;

		    // Prevent asteroid from sticking inside shield
		    var temp = new PolarVector(this.player_.shieldRadius + a.radius, theta);
		    a.x = this.player_.x + temp.getX();
		    a.y = this.player_.y + temp.getY();

		    this.player_.shieldHealth--;
		    if (this.player_.shieldHealth < 1) this.player_.isShielded = false;
		}
	    } else if (!this.gameOver) {
		if (distanceBetween(this.player_.x, this.player_.y, a.x, a.y) < this.player_.radius + a.radius) {
		    console.log("You lose. Your final score is " + this.score);
		    this.gameOver = true;
		}
	    }

	    // Wraparound world
	    if (a.y + a.radius < 0) {
		a.y = this.height_ + a.radius;
	    } else if (a.y - a.radius > this.height_) {
		a.y = -1 * a.radius;
	    }
	    if (a.x + a.radius < 0) {
		a.x = this.width_ + a.radius;
	    } else if (a.x - a.radius > this.width_) {
		a.x = -1 * a.radius;
	    }
	    
	    a.updatePosition();
	}

	for (var i in this.blasts_) {
	    var b = this.blasts_[i];
	    for (var j in this.asteroids_) {
		var a = this.asteroids_[j];
		if (distanceBetween(b.x, b.y, a.x, a.y) < b.radius + a.radius) {
		    var resultant = addMomentums(a.mass, a.v, b.mass, b.v);
		    var nv = new PolarVector(resultant.r / a.mass, resultant.theta);
		    a.v = nv;
		    this.blasts_.splice(i, 1);
		    a.health--;
		    if (a.health < 1) {
			this.asteroids_.splice(j, 1);
			if (!this.gameOver) this.score++;
		    }
		}
	    }
	    if ((b.y + b.radius < 0) ||
		(b.y - b.radius > this.height_) ||
		(b.x + b.radius < 0) ||
		(b.x - b.radius > this.width_)) {
		this.blasts_.splice(i, 1);
	    }
	    b.updatePosition();
	}

	this.previousTime = this.currentTime;
    }

    this.draw = function(canvasContext) {
	// Draw background
	canvasContext.fillStyle = '#333';
	canvasContext.fillRect(0, 0, this.width_, this.height_);

	// Draw charge meter
	this.drawChargeMeter(canvasContext);

	// Draw player
	var v1 = new PolarVector(this.player_.radius * 4 / 3, this.player_.direction);
	var v2 = new PolarVector(this.player_.radius, this.player_.direction + 2 * Math.PI / 3);
	var v3 = new PolarVector(this.player_.radius, this.player_.direction + 4 * Math.PI / 3);
	canvasContext.fillStyle = '#369';
	canvasContext.beginPath();
	canvasContext.moveTo(this.player_.x + v1.getX(), this.player_.y + v1.getY());
	canvasContext.lineTo(this.player_.x + v2.getX(), this.player_.y + v2.getY());
	canvasContext.lineTo(this.player_.x, this.player_.y);
	canvasContext.lineTo(this.player_.x + v3.getX(), this.player_.y + v3.getY());
	canvasContext.closePath();
	canvasContext.fill();

	// Draw shield
	if (this.player_.isShielded) {
	    canvasContext.beginPath();
	    canvasContext.arc(this.player_.x, this.player_.y, this.player_.shieldRadius, 0, 2 * Math.PI, true);
	    canvasContext.strokeStyle = '#9cf';
	    canvasContext.stroke();
	}

	// Draw asteroids
	for (var i in this.asteroids_) {
	    var a = this.asteroids_[i];
	    canvasContext.beginPath();
	    canvasContext.arc(a.x, a.y, a.radius, 0, 2 * Math.PI, true);
	    canvasContext.fillStyle = '#777';
	    canvasContext.fill();
	}

	// Draw blasts
	for (var i in this.blasts_) {
	    var b = this.blasts_[i];
	    canvasContext.beginPath();
	    canvasContext.arc(b.x, b.y, b.radius, 0, 2 * Math.PI, true);
	    var color = (b.isCharged) ? '#f30' : '#f90';
	    canvasContext.fillStyle = color;
	    canvasContext.fill();
	}

	// Draw score
	this.drawScore(canvasContext);

	// Draw shield health
	if (this.player_.isShielded) {
	    this.drawShieldHealth(canvasContext);
	}

	// Draw heat meter
	this.drawHeatMeter(canvasContext);
    }

    this.drawChargeMeter = function(canvasContext) {
	var innerOffset = 4;
	var maxAngle = Math.PI;
	var amountFilled = 0;

	// Draw if charging or charged
	if (this.isCharging) {
	    if (this.isCharged) {
		amountFilled = 1;
	    } else {
		amountFilled = (this.currentTime - this.startChargeTime) / this.chargeThresholdTime;
		amountFilled = (amountFilled > 1) ? 1 : amountFilled;
	    }
	    var sideAngle = maxAngle / 2 * amountFilled;

	    var v1 = new PolarVector(this.player_.shieldRadius - innerOffset, (this.player_.direction - sideAngle) % (2 * Math.PI));
	    var v2 = new PolarVector(this.player_.shieldRadius - innerOffset, (this.player_.direction + sideAngle) % (2 * Math.PI));

	    canvasContext.beginPath();
	    canvasContext.moveTo(this.player_.x, this.player_.y);
	    canvasContext.lineTo(this.player_.x + v1.getX(), this.player_.y + v1.getY());
	    canvasContext.lineTo(this.player_.x + v2.getX(), this.player_.y + v2.getY());
	    canvasContext.closePath();
	    canvasContext.fillStyle = '#fff';
	    canvasContext.fill();

	    canvasContext.beginPath();
	    canvasContext.arc(this.player_.x, this.player_.y, this.player_.shieldRadius - innerOffset, (this.player_.direction - sideAngle) % (2 * Math.PI), (this.player_.direction + sideAngle) % (2 * Math.PI));
	    canvasContext.fill();
	}
    }

    this.drawScore = function(canvasContext) {
	canvasContext.font = 'normal 16px montserrat';
	canvasContext.fillStyle = '#fff';
	canvasContext.fillText("SCORE " + this.score, 8, 24)
    }

    this.drawShieldHealth = function(canvasContext) {
	var outerOffset = 8;
	var innerOffset = 4;
	var barHeight = 20;
	var barWidth = 8;

	for (var i = 0; i < this.player_.shieldHealth; i++) {
	    var x = this.width_ - (outerOffset + barWidth + i * (innerOffset + barWidth));
	    canvasContext.fillStyle = '#fff';
	    canvasContext.fillRect(x, outerOffset, barWidth, barHeight);
	}
    }

    this.drawHeatMeter = function(canvasContext) {
	var outerOffset = 8;
	var innerOffset = 4;
	var borderWidth = 2;
	var barHeight = 16;
	var barLength = this.width_ - 2 * outerOffset - 2 * innerOffset;
	var outerWidth = borderWidth + 2 * innerOffset + barLength;
	var outerHeight = borderWidth + 2 * innerOffset + barHeight;

	// Draw the outer border
	canvasContext.lineWidth = borderWidth;
	canvasContext.strokeStyle = '#fff';
	canvasContext.strokeRect(outerOffset - 0.5 * borderWidth,
				 this.height_ - outerOffset - outerHeight + 0.5 * borderWidth,
				 outerWidth,
				 outerHeight);

	// Draw the inner bar
	var amountFilled = this.currentHeat / this.maxHeat;
	amountFilled = (amountFilled > 1) ? 1 : amountFilled;
	if (this.isOverheated) {
	    canvasContext.fillStyle = '#c00';
	} else {
	    canvasContext.fillStyle = '#fff';
	}
	canvasContext.fillRect(outerOffset + innerOffset,
			       this.height_ - outerOffset - innerOffset - barHeight,
			       barLength * amountFilled,
			       barHeight);
    }
}
