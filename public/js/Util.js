function Position(x, y) {
    this.x = x;
    this.y = y;
}

function PolarVector(r, theta) {
    this.r = r;
    this.theta = theta;
    this.getX = function() {
	return r * Math.cos(theta);
    }
    this.getY = function() {
	return r * Math.sin(theta);
    }
    this.add = function(vec) {
	var nx = this.getX() + vec.getX();
	var ny = this.getY() + vec.getY();
	
	var nr = Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2));
	
	var ntheta;

	if (nx > 0) {
	    ntheta = Math.atan(ny / nx) % (2 * Math.PI);
	} else {
	    ntheta = (Math.PI - Math.atan(ny / nx)) % (2 * Math.PI);
	}
	
	r = nr;
	theta = ntheta;
    }
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
