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
    //this.isCharged = isCharged;
    this.chargeFrac = chargeFrac;

    this.radius = 2;
    this.v = new PolarVector(2 + 6 * chargeFrac, this.direction);

    /*
    if (isCharged) {
	this.radius = 8;
	this.v = new PolarVector(8, this.direction);
    } else {
	this.radius = 4;
	this.v = new PolarVector(4, this.direction);
    }
    */
    this.density = 4;
    this.mass = this.density * Math.pow(this.radius, 3);

    this.updatePosition = function(fps, dt) {
	var step = 1000 / fps;
	this.x += this.v.getX() * dt / step;
	this.y += this.v.getY() * dt / step;
    };
}

function Player(position, radius, shieldRadius, shieldHealth, direction) {
    this.x = position.x;
    this.y = position.y;
    this.radius = radius;
    this.shieldRadius = shieldRadius;
    this.shieldHealth = shieldHealth;
    this.isShielded = (this.shieldHealth > 0);
    this.direction = direction;
}
