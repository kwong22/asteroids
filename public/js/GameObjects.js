function Asteroid(position, velocity, radius, health) {
    this.x = position.x;
    this.y = position.y;
    this.v = velocity;
    this.radius = radius;
    this.health = health;

    this.density = 10;
    this.mass = this.density * Math.pow(this.radius, 3);

    this.updatePosition = function() {
	this.x += this.v.getX();
	this.y += this.v.getY();
    };
}

function Blast(position, direction, isCharged) {
    this.x = position.x;
    this.y = position.y;
    this.direction = direction;
    this.isCharged = isCharged;

    this.radius = 0;
    this.v = 0;
    
    if (isCharged) {
	this.radius = 8;
	this.v = new PolarVector(8, this.direction);
    } else {
	this.radius = 4;
	this.v = new PolarVector(4, this.direction);
    }

    this.density = 4;
    this.mass = this.density * Math.pow(this.radius, 3);

    this.updatePosition = function() {
	this.x += this.v.getX();
	this.y += this.v.getY();
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
