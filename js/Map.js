/**
  * Thanks to http://hakim.se for the particles code
  */
function Map(imgRepository) {
    var score = 0;
    var asteroids = [];
    var blasts = [];
    var floaters = [];
    var particles = [];
    var rumble = new Rumble();
    var width = 300;
    var height = 400;
    var player = null;
    var blastLogBook = [];
    var hitLogBook = [];
    var blastLogId = 0;
    var hitLogId = 0;

    var chargeThresholdTime = 1000;
    var startChargeTime = 0;
    var isCharging = false;
    var isCharged = false;

    var currentHeat = 0;
    var blastHeat = 25;
    var maxHeat = 100;
    var cooldownRate = 0.5;
    var isOverheated = false;
    var overheatDuration = 0;
    var startOverheatTime = 0;

    var startHitTime = 0;
    var hitDuration = 500;
    var wasHit = false;

    var startTime = 0;
    var currentTime = 0;
    var previousTime = 0;
    var TIME_LIMIT = 90000; // in milliseconds
    var timeElapsed = 0;

    var currentStage = 0;

    var gameOver = false;

    var ImageRepository = imgRepository;
    this.isLoaded = false;

    this.loadMap = function() {

	score = 0;

	// Load in the map
	var playerX = width / 2;
	var playerY = height / 2;
	var playerRadius = 18;
	var shieldRadius = 32;
	var shieldHealth = 4;
	player = new Player(new Position(playerX, playerY), playerRadius, shieldRadius, shieldHealth, 3 * Math.PI / 2);

	blastLogBook = [];
	hitLogBook = [];
	blastLogId = 0;
	hitLogId = 0;

	startChargeTime = 0;
	isCharging = false;
	isCharged = false;

	currentHeat = 0;
	isOverheated = false;
	startOverheatTime = 0;

	startHitTime = 0;
	wasHit = false;

	startTime = (new Date()).getTime();
	currentTime = (new Date()).getTime();
	previousTime = (new Date()).getTime();
	timeElapsed = 0;

	currentStage = 0;
	this.startStage();

	gameOver = false;

	this.isLoaded = true;
    };

    this.startStage = function() {
	if (asteroids.length > 0) asteroids.clear();
	if (blasts.length > 0) blasts.clear();

	var totalHealth = 2 * (currentStage + 1);
	var remainingHealth = totalHealth;
	var numLevels = 2; // The number of different asteroid levels
	var basicSize = 8;
	var sizeRange = 2;
	var basicSpeed = 1.5;
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
	var maxx = width + radius;
	var miny = -1 * radius;
	var maxy = height + radius;
	var x = getRandomArbitrary(minx, maxx);
	var y = getRandomArbitrary(miny, maxy);
	var angle = 0;
	var angleBuffer = Math.PI / 12; // To force asteroid toward playing area

	var coin = Math.floor(getRandomArbitrary(0, 2));
	if (coin > 0) {
	    // Left or right
	    if (x < width / 2) {
		x = minx;
		angle = getRandomArbitrary(-1 * Math.PI / 2 + angleBuffer, Math.PI / 2 - angleBuffer);
	    } else {
		x = maxx;
		angle = getRandomArbitrary(Math.PI / 2 + angleBuffer, Math.PI * 3 / 2 - angleBuffer);
	    }
	} else {
	    // Top or bottom
	    if (y < height / 2) {
		y = miny;
		angle = getRandomArbitrary(angleBuffer, Math.PI - angleBuffer);
	    } else {
		y = maxy;
		angle = getRandomArbitrary(Math.PI + angleBuffer, 2 * Math.PI - angleBuffer);
	    }
	}

	asteroids.push(new Asteroid(new Position(x, y), new PolarVector(speed, angle), radius, health));
    };

    this.spawnFloater = function(position) {
        floaters.push(new Floater(position, 0.5, '+1', '#fff', 500));
    };

    this.aimBlaster = function(location) {
	this.updateBlasterDirection(location);
	if (!isCharging && !isOverheated) {
	    isCharging = true;
	    startChargeTime = (new Date()).getTime();
	}
    };

    this.updateBlasterDirection = function(location) {
	var dx = location.x - player.x;
	var dy = location.y - player.y;
	player.direction = determineAngle(dx, dy);
    };

    this.createBlast = function(location) {
	this.updateBlasterDirection(location);

	var chargeFrac = 0;
	if (!isOverheated) {
	    if (isCharging) {
		if (isCharged) {
		    chargeFrac = 1;
		} else {
		    chargeFrac = (currentTime - startChargeTime) / chargeThresholdTime;
		}
	    }

	    blasts.push(new Blast(new Position(player.x, player.y), player.direction, chargeFrac));
	    this.addToBlastLogBook(location);

	    currentHeat += blastHeat;
	    if (currentHeat > maxHeat) {
		currentHeat = maxHeat;
		isOverheated = true;
		startOverheatTime = (new Date()).getTime();
	    }
	}

	isCharged = false;
	isCharging = false;
	startChargeTime = 0;
    };

    /**
      * Emits a random number of particles from a set point.
      *
      * @param position The point where particles will be
      * emitted from
      * @param spread The pixel spread of the emittal
      */
    this.emitParticles = function (position, direction, spread, seed, color) {
        var q = seed + (Math.random() * seed);

        while(--q >= 0) {
            var p = new Particle();
            p.position.x = position.x + (Math.sin(q) * spread);
            p.position.y = position.y + (Math.cos(q) * spread);
            p.velocity = {x: direction.getX() + (-1 + Math.random() * 2), y: direction.getY() + (-1 + Math.random() * 2)};
            p.alpha = 1;
            p.color = color;

            particles.push(p);
        }
    };

    this.createRumble = function (duration) {
        if (!rumble.active) {
            rumble.activate(duration);
        }
    };

    this.createBlastLogEntry = function(location) {
	var entry = {
	    '_id': blastLogId++,
	    'x': location.x,
	    'y': location.y,
	    'date': new Date()
	};
	return entry;
    };

    this.createHitLogEntry = function(location) {
	var entry = {
	    '_id': hitLogId++,
	    'x': location.x,
	    'y': location.y,
	    'date': new Date()
	};
	return entry;
    };

    this.addToBlastLogBook = function(location) {
	blastLogBook.push(this.createBlastLogEntry(location));
    };

    this.addToHitLogBook = function(location) {
	hitLogBook.push(this.createHitLogEntry(location));
    };

    this.returnBlastLogBook = function() {
	for (var i = 0; i < blastLogBook.length; i++) {
	    console.log(blastLogBook[i]);
	}
    };

    this.returnHitLogBook = function() {
	for (var i = 0; i < hitLogBook.length; i++) {
	    console.log(hitLogBook[i]);
	}
    };

    this.update = function() {

	if (!gameOver) {
	    currentTime = (new Date()).getTime();

	    // Check if time limit has been reached
	    timeElapsed = currentTime - startTime;
	    if (timeElapsed >= TIME_LIMIT) {
		this.endGame();
	    }

	    // For time-based intervals, does not depend on frame rate
	    var fps = 60; // The frame rate that the game is based on
	    var step = 1000 / fps;
	    var dt = currentTime - previousTime;
	    var tfactor = dt / step;

	    if (isCharging) {
		if (startChargeTime !== 0) {
		    if (currentTime - startChargeTime >= chargeThresholdTime) {
			isCharged = true;
			startChargeTime = 0;
		    }
		}
	    }

	    if (isOverheated) {
		if (currentTime - startOverheatTime >= overheatDuration) {
		    if (currentHeat >= cooldownRate * tfactor) {
			currentHeat -= cooldownRate * tfactor;
		    } else {
			currentHeat = 0;
			isOverheated = false;
			startOverheatTime = 0;
		    }
		}
	    } else if (currentHeat >= cooldownRate * tfactor) {
		currentHeat -= cooldownRate * tfactor;
	    } else {
		currentHeat = 0;
	    }

	    if (wasHit) {
		if (currentTime - startHitTime >= hitDuration) {
		    startHitTime = 0;
		    wasHit = false;
		}
	    }

            rumble.update(fps, dt);
	    this.updateAsteroids(fps, dt);
	    this.updateBlasts(fps, dt);
            this.updateFloaters(fps, dt);
            this.updateParticles(fps, dt);

	    // Check if stage has been completed
	    if (asteroids.length < 1) {
		currentStage++;
		this.startStage();
	    }

	    previousTime = currentTime;
	}
    };

    this.updateAsteroids = function(fps, dt) {
	for (var i = 0; i < asteroids.length; i++) {
	    var a = asteroids[i];

	    // Check for collisions with shield
	    if (player.isShielded) {
		if (distanceBetween(player.x, player.y, a.x, a.y) < player.shieldRadius + a.radius) {
		    var dx = a.x - player.x;
		    var dy = a.y - player.y;
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
		    var temp = new PolarVector(player.shieldRadius + a.radius, theta);
		    a.x = player.x + temp.getX();
		    a.y = player.y + temp.getY();

                    // Add particle effect
                    var collVec = new PolarVector(player.shieldRadius, theta);
                    var collPos = new Position(player.x + collVec.getX(), player.y + collVec.getY());
                    this.emitParticles(collPos, new PolarVector(1, theta), 5, 10, '#f00');

                    this.createRumble(400);

		    player.shieldHealth--;
		    startHitTime = (new Date()).getTime();
		    wasHit = true;
		    if (player.shieldHealth < 1) player.isShielded = false;
		}
	    } else if (!gameOver) {
		if (distanceBetween(player.x, player.y, a.x, a.y) < player.radius + a.radius) {
		    this.endGame();
		}
	    }

	    // Wraparound world
	    if (a.y + a.radius < 0) {
		a.y = height + a.radius;
	    } else if (a.y - a.radius > height) {
		a.y = -1 * a.radius;
	    }
	    if (a.x + a.radius < 0) {
		a.x = width + a.radius;
	    } else if (a.x - a.radius > width) {
		a.x = -1 * a.radius;
	    }

	    a.updatePosition(fps, dt);
	}
    };

    this.updateBlasts = function(fps, dt) {
	for (var i = blasts.length - 1; i >= 0; i--) {
	    var b = blasts[i];

	    for (var j = asteroids.length - 1; j >= 0; j--) {
		var a = asteroids[j];
		if (distanceBetween(b.x, b.y, a.x, a.y) < b.radius + a.radius) {
		    this.addToHitLogBook(new Position(a.x, a.y));
		    var resultant = addMomentums(a.mass, a.v, b.mass, b.v);
		    var nv = new PolarVector(resultant.r / a.mass, resultant.theta);
		    if (a.health > 1) {
			var nradius = Math.pow(0.5, 1 / 3) * a.radius;
			var splitAngle = Math.PI / 4;
			var a1 = new Asteroid(new Position(a.x, a.y), new PolarVector(nv.r / Math.sqrt(2), nv.theta - splitAngle), nradius, a.health / 2);
			var a2 = new Asteroid(new Position(a.x, a.y), new PolarVector(nv.r / Math.sqrt(2), nv.theta + splitAngle), nradius, a.health / 2);
			asteroids.push(a1, a2);
                        this.emitParticles(new Position(a.x, a.y), new PolarVector(1, b.direction), 5, 5, '#fff');
		    } else {
                        this.emitParticles(new Position(a.x, a.y), new PolarVector(1, b.direction), 5, 15, '#fff');
                    }
		    if (!gameOver) score++;

                    this.spawnFloater(new Position(a.x, a.y));
                    this.createRumble(200);
		    asteroids.splice(j, 1);
		    blasts.splice(i, 1);
		}
	    }
	    if ((b.y + b.radius < 0) ||
		(b.y - b.radius > height) ||
		(b.x + b.radius < 0) ||
		(b.x - b.radius > width)) {
		blasts.splice(i, 1);
	    }
	    b.updatePosition(fps, dt);
	}
    };

    this.updateFloaters = function (fps, dt) {
        for (var i = floaters.length - 1; i >= 0; i--) {
            var f = floaters[i];
            f.update(fps, dt);
            if (f.isFinished) {
                floaters.splice(i, 1);
            }
        }
    };

    this.updateParticles = function (fps, dt) {
        var step = 1000 / fps;

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];

            // Apply velocity to the particle
            p.position.x += p.velocity.x * dt / step;
            p.position.y += p.velocity.y * dt / step;

            // Fade out
            p.alpha -= 0.02 * dt / step;

            // If the particle is faded out to less than zero, remove it
            if(p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }
    };

    this.endGame = function() {
	gameOver = true;
    };

    this.draw = function(canvasContext) {
	// Draw background
	var sprite = ImageRepository.sprites.bg;
	canvasContext.drawImage(sprite.img, 0, 0, sprite.w, sprite.h);

	if (!gameOver) {
            if (rumble.active) {
                canvasContext.translate(rumble.x, rumble.y);
            }

	    // Draw charge meter
	    this.drawChargeMeter(canvasContext);

	    // Draw blasts
	    for (var i = 0; i < blasts.length; i++) {
		var b = blasts[i];
		canvasContext.save(); // Save the current coordinate system
		canvasContext.translate(b.x, b.y);
		canvasContext.rotate(b.v.theta + Math.PI / 2);
		sprite = ImageRepository.sprites.blast;
		canvasContext.drawImage(sprite.img, sprite.cx, -1 * b.radius, sprite.w, sprite.h);
		canvasContext.restore(); // Restore the original coordinate system
	    }

	    // Draw the player
	    canvasContext.save();
	    canvasContext.translate(player.x, player.y);
	    canvasContext.rotate(player.direction + Math.PI / 2);
	    sprite = ImageRepository.sprites[player.imgName];
	    canvasContext.drawImage(sprite.img, sprite.cx, sprite.cy, sprite.w, sprite.h);
	    canvasContext.restore();

	    // Draw shield
	    if (player.isShielded) {
		canvasContext.beginPath();
		canvasContext.arc(player.x, player.y, player.shieldRadius, 0, 2 * Math.PI, true);
		canvasContext.fillStyle = '#900';
		canvasContext.globalAlpha = 0.25;
		canvasContext.fill();
		canvasContext.globalAlpha = 1;
		canvasContext.lineWidth = 2;
		canvasContext.strokeStyle = '#f00';
		canvasContext.stroke();
	    }

	    // Draw asteroids
	    for (var j = 0; j < asteroids.length; j++) {
		var a = asteroids[j];
		sprite = ImageRepository.sprites.asteroid;
		var width = 2 * a.radius;
		canvasContext.drawImage(sprite.img, a.x - a.radius, a.y - a.radius, width, width);
	    }

            this.drawFloaters(canvasContext);
            this.drawParticles(canvasContext);

            if (rumble.active) {
                canvasContext.translate(-1 * rumble.x, -1 * rumble.y);
            }

            this.drawScore(canvasContext);
	    this.drawTimeLeft(canvasContext);
	    this.drawHeatMeter(canvasContext);

	    // Draw shield health
	    if (player.isShielded) {
		this.drawShieldHealth(canvasContext);
	    }
	} else {
	    this.drawGameOver(canvasContext);
	}
    };

    this.drawChargeMeter = function(canvasContext) {
	var innerOffset = 4;
	var maxAngle = Math.PI;
	var amountFilled = 0;

	// Draw if charging or charged
	if (isCharging) {
	    if (isCharged) {
		amountFilled = 1;
	    } else {
		amountFilled = (currentTime - startChargeTime) / chargeThresholdTime;
		amountFilled = Math.min(1, amountFilled);
	    }
	    var sideAngle = maxAngle / 2 * amountFilled;

	    var v1 = new PolarVector(player.shieldRadius - innerOffset, (player.direction - sideAngle) % (2 * Math.PI));
	    var v2 = new PolarVector(player.shieldRadius - innerOffset, (player.direction + sideAngle) % (2 * Math.PI));

	    canvasContext.beginPath();
	    canvasContext.moveTo(player.x, player.y);
	    canvasContext.lineTo(player.x + v1.getX(), player.y + v1.getY());
	    canvasContext.lineTo(player.x + v2.getX(), player.y + v2.getY());
	    canvasContext.closePath();
            canvasContext.globalAlpha = 0.5;
	    canvasContext.fillStyle = '#fff';
	    canvasContext.fill();

	    canvasContext.beginPath();
	    canvasContext.arc(player.x, player.y, player.shieldRadius - innerOffset, (player.direction - sideAngle) % (2 * Math.PI), (player.direction + sideAngle) % (2 * Math.PI));
	    canvasContext.fill();
            canvasContext.globalAlpha = 1;
	}
    };

    this.drawScore = function(canvasContext) {
	canvasContext.font = 'normal 16px montserrat';
	canvasContext.fillStyle = '#fff';
	canvasContext.fillText('SCORE ' + score, 8, 24);
    };

    this.drawTimeLeft = function(canvasContext) {
	var timeLeft = TIME_LIMIT - timeElapsed;
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
	var innerOffset = 0;
	var barHeight = 20;
	var barWidth = 20;
        var sprite = ImageRepository.sprites.ship;

	for (var i = 0; i < player.shieldHealth; i++) {
	    var x = width - (outerOffset + barWidth + i * (innerOffset + barWidth));
            canvasContext.drawImage(sprite.img, x, outerOffset, barWidth, barHeight);
	}
    };

    this.drawHeatMeter = function(canvasContext) {
	var outerOffset = 8;
	var innerOffset = 4;
	var borderWidth = 2;
	var barHeight = 16;
	var barLength = width - 2 * outerOffset - 2 * innerOffset;
	var outerWidth = borderWidth + 2 * innerOffset + barLength;
	var outerHeight = borderWidth + 2 * innerOffset + barHeight;

	// Draw the outer border
	canvasContext.lineWidth = borderWidth;
	canvasContext.strokeStyle = '#fff';
	canvasContext.strokeRect(outerOffset - 0.5 * borderWidth,
				 height - outerOffset - outerHeight + 0.5 * borderWidth,
				 outerWidth,
				 outerHeight);

	// Draw the inner bar
	var amountFilled = currentHeat / maxHeat;
	amountFilled = (amountFilled > 1) ? 1 : amountFilled;
	if (isOverheated) {
	    canvasContext.fillStyle = '#c00';
	} else {
	    canvasContext.fillStyle = '#fff';
	}
	canvasContext.fillRect(outerOffset + innerOffset,
			       height - outerOffset - innerOffset - barHeight,
			       barLength * amountFilled,
			       barHeight);
    };

    this.drawFloaters = function(canvasContext) {
        for (var i = 0; i < floaters.length; i++) {
            floaters[i].render(canvasContext);
        }
    };

    this.drawParticles = function (canvasContext) {
        var size = 1;
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            canvasContext.globalAlpha = Math.max(p.alpha, 0);
            canvasContext.fillStyle = p.color;
            canvasContext.fillRect(p.position.x, p.position.y, size, size);
            canvasContext.globalAlpha = 1;
        }
    };

    this.drawGameOver = function(canvasContext) {
	var x = width / 4;
	var y = height / 4;
	canvasContext.font = 'normal 24px montserrat';
	canvasContext.fillStyle = '#fff';
	canvasContext.fillText('GAME OVER', x, y);
	canvasContext.font = 'normal 16px montserrat';
	canvasContext.fillText('Your final score is ' + score, x, y + 24);
    };
}
