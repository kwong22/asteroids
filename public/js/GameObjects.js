function Asteroid(position, velocity, radius, health) {
    this.x = position.x;
    this.y = position.y;
    this.v = velocity;
    this.radius = radius;
    this.health = health;

    this.density = 10;
    this.mass = this.density * Math.pow(this.radius, 3);

    this.updatePosition = function(fps, dt) {
	var step = 1000 / fps;
	this.x += this.v.getX() * dt / step;
	this.y += this.v.getY() * dt / step;
    };
}

function Blast(position, direction, chargeFrac) {
    this.x = position.x;
    this.y = position.y;
    this.direction = direction;
    this.chargeFrac = chargeFrac;

    this.radius = 2;
    this.v = new PolarVector(2 + 6 * chargeFrac, this.direction);

    this.density = 4;
    this.mass = this.density * Math.pow(this.radius, 3);

    this.updatePosition = function(fps, dt) {
	var step = 1000 / fps;
	this.x += this.v.getX() * dt / step;
	this.y += this.v.getY() * dt / step;
    };
}

function Player(position, radius, shieldRadius, shieldHealth, direction) {
    this.imgName = 'ship';
    this.x = position.x;
    this.y = position.y;
    this.radius = radius;
    this.shieldRadius = shieldRadius;
    this.shieldHealth = shieldHealth;
    this.isShielded = (this.shieldHealth > 0);
    this.direction = direction;
}

function Floater(position, speed, text,
                 color, duration) {
    this.position = position;
    this.speed = speed;
    this.text = text;
    this.color = color;
    this.startTime = (new Date()).getTime();
    this.timeElapsed = 0;
    this.duration = duration;
    this.isFinished = false;
}

Floater.prototype.update = function (fps, dt) {
    var currentTime = (new Date()).getTime();
    this.timeElapsed = currentTime - this.startTime;

    if (this.timeElapsed >= this.duration) {
        this.isFinished = true;
    }

    var step = 1000 / fps;
    this.position.y -= this.speed * dt / step;
};

Floater.prototype.render = function (canvasContext) {
    canvasContext.font = 'normal 16px montserrat';
    canvasContext.fillStyle = this.color;
    canvasContext.globalAlpha = (this.duration - this.timeElapsed) / this.duration;
    canvasContext.fillText(this.text, this.position.x, this.position.y);
    canvasContext.globalAlpha = 1;
};

function Particle(x, y) {
    this.position = new Position(x, y);
}

function Rumble() {
    this.startTime = 0;
    this.duration = 0;
    this.maxAmp = 4;
    this.x = 0;
    this.y = 0;
    this.active = false;
}

Rumble.prototype.activate = function (duration) {
    this.startTime = (new Date()).getTime();
    this.duration = duration;
    this.active = true;
};

Rumble.prototype.update = function (fps, dt) {
    if (this.active) {
        var currentTime = (new Date()).getTime();
        var timeElapsed = currentTime - this.startTime;

        if (timeElapsed < this.duration) {
            var step = 1000 / fps;
            var rand = Math.random() * 2 * Math.PI;
            var vec = new PolarVector(this.maxAmp * (this.duration - timeElapsed) / this.duration, rand);
            this.x = vec.getX() * dt / step;
            this.y = vec.getY() * dt / step;
        } else {
            this.active = false;
        }
    }
};
