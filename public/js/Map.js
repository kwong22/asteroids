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
    this.blastHeat = 25;
    this.maxHeat = 100;
    this.cooldownRate = 0.5;
    this.isOverheated = false;
    this.overheatDuration = 0;
    this.startOverheatTime = 0;

    this.startHitTime = 0;
    this.hitDuration = 500;
    this.wasHit = false;

    this.startTime = 0;
    this.currentTime = 0;
    this.previousTime = 0;
    this.TIME_LIMIT = 90000; // in milliseconds
    this.timeElapsed = 0;

    this.currentStage = 0;

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
	var shieldHealth = 4;
	this.player_ = new Player(new Position(playerX, playerY), playerRadius, shieldRadius, shieldHealth, 3 * Math.PI / 2);

	this.startChargeTime = 0;
	this.isCharging = false;
	this.isCharged = false;

	this.currentHeat = 0;
	this.isOverheated = false;
	this.startOverheatTime = 0;

	this.startHitTime = 0;
	this.wasHit = false;

	this.startTime = (new Date).getTime();
	this.currentTime = (new Date).getTime();
	this.previousTime = (new Date).getTime();
	this.timeElapsed = 0;
	
	this.currentStage = 0;
	this.startStage();

	this.gameOver = false;
	
	this.isLoaded = true;
    };

    this.startStage = function() {
	if (this.asteroids_.length > 0) this.clearAsteroids();
	if (this.blasts_.length > 0) this.clearBlasts();

	var totalHealth = this.currentStage + 1;
	var remainingHealth = totalHealth;
	var numLevels = 2; // The number of different asteroid levels
	var basicSize = 8;
	var sizeRange = 2;
	var basicSpeed = 1;
	var speedRange = 0.25;

	while (remainingHealth > 0) {
	    var maxLevel = (remainingHealth > Math.pow(2, numLevels - 1)) ? numLevels : Math.floor(Math.log(remainingHealth) / Math.log(2));
	    var rand = Math.floor(getRandomArbitrary(0, maxLevel));

	    var aHealth = Math.pow(2, rand);

	    var dSize = getRandomArbitrary(-1 * sizeRange * (rand + 1) / 2, sizeRange * (rand + 1) / 2);
	    var aSize = Math.sqrt((rand + 1)) * basicSize + dSize;

	    var dSpeed = getRandomArbitrary(-1 * speedRange / 2, speedRange / 2);
	    var aSpeed = (basicSpeed + dSpeed) * 1.2 / (rand + 1);

	    this.spawnAsteroid(aSize, aHealth, aSpeed);
	    remainingHealth -= aHealth;
	}
    };

    this.spawnAsteroid = function(radius, health, speed) {
	var minx = -1 * radius;
	var maxx = this.width_ + radius;
	var miny = -1 * radius;
	var maxy = this.height_ + radius;
	var x = getRandomArbitrary(minx, maxx);
	var y = getRandomArbitrary(miny, maxy);
	var angle = 0;
	var angleBuffer = Math.PI / 12; // To force asteroid toward playing area

	var coin = Math.floor(getRandomArbitrary(0, 2));
	if (coin > 0) {
	    // Left or right
	    if (x < this.width_ / 2) {
		x = minx;
		angle = getRandomArbitrary(-1 * Math.PI / 2 + angleBuffer, Math.PI / 2 - angleBuffer);
	    } else {
		x = maxx;
		angle = getRandomArbitrary(Math.PI / 2 + angleBuffer, Math.PI * 3 / 2 - angleBuffer);
	    }
	} else {
	    // Top or bottom
	    if (y < this.height_ / 2) {
		y = miny;
		angle = getRandomArbitrary(angleBuffer, Math.PI - angleBuffer);
	    } else {
		y = maxy;
		angle = getRandomArbitrary(Math.PI + angleBuffer, 2 * Math.PI - angleBuffer);
	    }
	}

	this.asteroids_.push(new Asteroid(new Position(x, y), new PolarVector(speed, angle), radius, health));
    };

    this.clearAsteroids = function() {
	for (var i = this.asteroids_.length - 1; i >= 0; i--) {
	    this.asteroids_.splice(i, 1);
	}
    };

    this.clearBlasts = function() {
	for (var i = this.blasts_.length - 1; i >= 0; i--) {
	    this.blasts_.splice(i, 1);
	}
    };

    this.aimBlaster = function(location) {
	this.updateBlasterDirection(location);
	if (!this.isCharging && !this.isOverheated) {
	    this.isCharging = true;
	    this.startChargeTime = (new Date).getTime();
	}
    };

    this.updateBlasterDirection = function(location) {
	var dx = location.x - this.player_.x;
	var dy = location.y - this.player_.y;
	this.player_.direction = determineAngle(dx, dy);
    };

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
    };

    this.update = function() {

	if (!this.gameOver) {
	    this.currentTime = (new Date).getTime();

	    // Check if time limit has been reached
	    this.timeElapsed = this.currentTime - this.startTime;
	    if (this.timeElapsed >= this.TIME_LIMIT) this.gameOver = true;

	    // For time-based intervals, does not depend on frame rate
	    var fps = 60; // The frame rate that the game is based on
	    var step = 1000 / fps;
	    var dt = this.currentTime - this.previousTime;
	    var tfactor = dt / step;

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
		    if (this.currentHeat >= this.cooldownRate * tfactor) {
			this.currentHeat -= this.cooldownRate * tfactor;
		    } else {
			this.currentHeat = 0;
			this.isOverheated = false;
			this.startOverheatTime = 0;
		    }
		}
	    } else if (this.currentHeat >= this.cooldownRate * tfactor) {
		this.currentHeat -= this.cooldownRate * tfactor;
	    } else {
		this.currentHeat = 0;
	    }

	    if (this.wasHit) {
		if (this.currentTime - this.startHitTime >= this.hitDuration) {
		    this.startHitTime = 0;
		    this.wasHit = false;
		}
	    }

	    this.updateAsteroids(fps, dt);

	    this.updateBlasts(fps, dt);

	    // Check if stage has been completed
	    if (this.asteroids_.length < 1) {
		this.currentStage++;
		this.startStage();
	    }

	    this.previousTime = this.currentTime;
	}
    };

    this.updateAsteroids = function(fps, dt) {
	for (var i = 0; i < this.asteroids_.length; i++) {
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
		    this.startHitTime = (new Date).getTime();
		    this.wasHit = true;
		    if (this.player_.shieldHealth < 1) this.player_.isShielded = false;
		}
	    } else if (!this.gameOver) {
		if (distanceBetween(this.player_.x, this.player_.y, a.x, a.y) < this.player_.radius + a.radius) {
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
	    
	    a.updatePosition(fps, dt);
	}
    };

    this.updateBlasts = function(fps, dt) {
	for (var i = this.blasts_.length - 1; i >= 0; i--) {
	    var b = this.blasts_[i];

	    for (var j = this.asteroids_.length - 1; j >= 0; j--) {
		var a = this.asteroids_[j];
		if (distanceBetween(b.x, b.y, a.x, a.y) < b.radius + a.radius) {
		    var resultant = addMomentums(a.mass, a.v, b.mass, b.v);
		    var nv = new PolarVector(resultant.r / a.mass, resultant.theta);
		    if (a.health > 1) {
			var nradius = Math.pow(0.5, 1 / 3) * a.radius;
			var splitAngle = Math.PI / 4;
			var a1 = new Asteroid(new Position(a.x, a.y), new PolarVector(nv.r / Math.sqrt(2), nv.theta - splitAngle), nradius, a.health / 2);
			var a2 = new Asteroid(new Position(a.x, a.y), new PolarVector(nv.r / Math.sqrt(2), nv.theta + splitAngle), nradius, a.health / 2);
			this.asteroids_.push(a1, a2);
		    } else {
			if (!this.gameOver) this.score++;
		    }

		    this.asteroids_.splice(j, 1);
		    this.blasts_.splice(i, 1);
		}
	    }
	    if ((b.y + b.radius < 0) ||
		(b.y - b.radius > this.height_) ||
		(b.x + b.radius < 0) ||
		(b.x - b.radius > this.width_)) {
		this.blasts_.splice(i, 1);
	    }
	    b.updatePosition(fps, dt);
	}
    };


    this.draw = function(canvasContext) {
	// Draw background
	canvasContext.fillStyle = '#333';
	canvasContext.fillRect(0, 0, this.width_, this.height_);

	if (!this.gameOver) {
	    // Draw charge meter
	    this.drawChargeMeter(canvasContext);

	    // Draw player
	    var v1 = new PolarVector(this.player_.radius * 4 / 3, this.player_.direction);
	    var v2 = new PolarVector(this.player_.radius, this.player_.direction + 2 * Math.PI / 3);
	    var v3 = new PolarVector(this.player_.radius, this.player_.direction + 4 * Math.PI / 3);
	    if (this.wasHit) {
		canvasContext.fillStyle = '#c00';
	    } else {
		canvasContext.fillStyle = '#369';
	    }
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
	    for (var i = 0; i < this.asteroids_.length; i++) {
		var a = this.asteroids_[i];
		canvasContext.beginPath();
		canvasContext.arc(a.x, a.y, a.radius, 0, 2 * Math.PI, true);
		canvasContext.fillStyle = '#777';
		canvasContext.fill();
	    }

	    // Draw blasts
	    for (var i = 0; i < this.blasts_.length; i++) {
		var b = this.blasts_[i];
		canvasContext.beginPath();
		canvasContext.arc(b.x, b.y, b.radius, 0, 2 * Math.PI, true);
		var color = (b.isCharged) ? '#f30' : '#f90';
		canvasContext.fillStyle = color;
		canvasContext.fill();
	    }

	    // Draw score
	    this.drawScore(canvasContext);

	    // Draw time left
	    this.drawTimeLeft(canvasContext);

	    // Draw shield health
	    if (this.player_.isShielded) {
		this.drawShieldHealth(canvasContext);
	    }

	    // Draw heat meter
	    this.drawHeatMeter(canvasContext);
	} else {
	    this.drawGameOver(canvasContext);
	}
    };

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
    };

    this.drawScore = function(canvasContext) {
	canvasContext.font = 'normal 16px montserrat';
	canvasContext.fillStyle = '#fff';
	canvasContext.fillText('SCORE ' + this.score, 8, 24);
    };

    this.drawTimeLeft = function(canvasContext) {
	var timeLeft = this.TIME_LIMIT - this.timeElapsed;
	var timeText;
	if (timeLeft > 0) {
	    var tempTime = Math.floor(timeLeft / 100);
	    timeText = ((tempTime % 10) === 0) ? tempTime / 10 + '.0 s' : tempTime / 10 + ' s'; // ex. to write time as "1.2 s"
	} else {
	    timeText = 'NO TIME REMAINING';
	}
	canvasContext.font = 'normal 16px montserrat';
	canvasContext.fillStyle = '#fff';
	canvasContext.fillText(timeText, 8, 48);
    };

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
    };

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
    };

    this.drawGameOver = function(canvasContext) {
	var x = this.width_ / 4;
	var y = this.height_ / 4;
	canvasContext.font = 'normal 24px montserrat';
	canvasContext.fillStyle = '#fff';
	canvasContext.fillText('GAME OVER', x, y);
	canvasContext.font = 'normal 16px montserrat';
	canvasContext.fillText('Your final score is ' + this.score, x, y + 24);
    };
}
