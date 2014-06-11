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
}

function distanceBetween(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function addVectors(v1, v2) {
    var nx = v1.getX() + v2.getX();
    var ny = v1.getY() + v2.getY();

    var nr = Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2));
    var ntheta = determineAngle(nx, ny);

    return new PolarVector(nr, ntheta);
}

function addMomentums(m1, v1, m2, v2) {
    var nx = m1 * v1.getX() + m2 * v2.getX();
    var ny = m1 * v1.getY() + m2 * v2.getY();

    var nr = Math.sqrt(Math.pow(nx, 2) + Math.pow(ny, 2));
    var ntheta = determineAngle(nx, ny);

    return new PolarVector(nr, ntheta);
}

function determineAngle(dx, dy) {
    var theta;
    if (dx > 0) {
        theta = (Math.atan(dy / dx)) % (2 * Math.PI); // The codomain of atan is -pi/2 to pi/2
    } else {
	theta = (Math.PI + Math.atan(dy / dx)) % (2 * Math.PI);
    }
    return theta;
}

function determineAngleBetweenVectors(v1, v2) {
    return Math.acos(dotProduct(v1, v2) / (v1.r * v2.r));
}

function dotProduct(v1, v2) {
    return v1.getX() * v2.getX() + v1.getY() * v2.getY();
}
