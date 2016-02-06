function Game() {

    var FPS = 60;
    var DRAW_INTERVAL = 1000 / FPS;
    var inputManager = new InputManager();
    var map;
    var imageRepository;
    var canvas;
    var canvasContext;
    var canvasBuffer;
    var canvasBufferContext;

    var initialized = false;
    var started = false;
    var gameLoop = null;

    this.initialize = function() {

	if (!initialized) {
	    inputManager.on('touchStart', document.game.handleTouchStart.bind(this));
	    inputManager.on('touchMove', document.game.handleTouchMove.bind(this));
	    inputManager.on('touchEnd', document.game.handleTouchEnd.bind(this));
            inputManager.on('startGame', document.game.handleStart.bind(this));

	    imageRepository = new ImageRepository();
	    map = new Map(imageRepository);

	    canvas = document.getElementById('game-canvas');

	    if (canvas && canvas.getContext) {

		canvasContext = canvas.getContext('2d');

		canvasBuffer = document.createElement('canvas');
		canvasBuffer.width = canvas.width;
		canvasBuffer.height = canvas.height;
		canvasBufferContext = canvasBuffer.getContext('2d');

		return true;
	    }

	    return false;

	} else {
	    return true;
	}
    };

    this.loadContent = function() {
	if (!initialized && gameLoop !== undefined) {
	    imageRepository.loadContent();
	    map.loadMap();
	    gameLoop = setInterval(this.runGameLoop, DRAW_INTERVAL);
	    initialized = true;
	}
    };

    this.run = function() {
	if (this.initialize()) {
            this.draw();
	}
    };

    this.runGameLoop = function() {
	if (map.isLoaded && imageRepository.loaded()) {
	    document.game.update();
	    document.game.draw();
	}
    };

    this.update = function() {
	map.update();
    };

    this.handleTouchStart = function(location) {
        if (started) {
	    map.aimBlaster(this.getCanvasCoordinates(location));
        }
    };

    this.handleTouchMove = function(location) {
        if (started) {
	    map.updateBlasterDirection(this.getCanvasCoordinates(location));
        }
    };

    this.handleTouchEnd = function(location) {
        if (started) {
	    map.createBlast(this.getCanvasCoordinates(location));
        }
    };

    this.handleStart = function () {
        if (!started) {
            started = true;
            this.loadContent();
        }
    };

    this.getCanvasCoordinates = function(clientLocation) {
	var rect = canvas.getBoundingClientRect();
	var x = clientLocation.x - rect.left;
	var y = clientLocation.y - rect.top;

	return new Position(x, y);
    };

    this.returnBlastLogBook = function() {
	map.returnBlastLogBook();
    };

    this.returnHitLogBook = function() {
	map.returnHitLogBook();
    };

    this.draw = function() {
        if (!started) {
            canvasContext.fillStyle = '#000';
            canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        } else {
	    // Clear canvas
	    canvasBufferContext.clearRect(0, 0, canvas.width, canvas.height);
	    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

	    // Draw map to buffer
	    map.draw(canvasBufferContext);

	    // Draw buffer on screen
	    canvasContext.drawImage(canvasBuffer, 0, 0);
        }
    };
}
