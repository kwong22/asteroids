function Asteroid(position, velocity, radius, health) {
    this.x = position.x;
    this.y = position.y;
    this.v = velocity;
    this.radius = radius;
    this.health = health;

    this.updatePosition = function() {
	this.x += this.v.getX();
	this.y += this.v.getY();
    }
}

function Blast(position, velocity, radius) {
    this.x = position.x;
    this.y = position.y;
    this.v = velocity;
    this.radius = radius;

    this.updatePosition = function() {
	this.x += this.v.getX();
	this.y += this.v.getY();
    }
}

function Player(position, radius, direction) {
    this.x = position.x;
    this.y = position.y;
    this.shieldRadius = radius;
    this.direction = direction;
}
