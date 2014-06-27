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

    var logBook, logId;

    var gameLoop = null;

    this.initialize = function() {

	inputManager.on('touchStart', document.game.handleTouchStart.bind(this));
	inputManager.on('touchMove', document.game.handleTouchMove.bind(this));
	inputManager.on('touchEnd', document.game.handleTouchEnd.bind(this));

	imageRepository = new ImageRepository();
	map = new Map(imageRepository);

	canvas = document.getElementById('game-canvas');

	logBook = [];
	logId = 0;

	if (canvas && canvas.getContext) {

	    canvasContext = canvas.getContext('2d');

	    canvasBuffer = document.createElement('canvas');
	    canvasBuffer.width = canvas.width;
	    canvasBuffer.height = canvas.height;
	    canvasBufferContext = canvasBuffer.getContext('2d');

	    return true;
	}

	return false;
    };

    this.loadContent = function() {
	imageRepository.loadContent();
	map.loadMap();
	gameLoop = setInterval(this.runGameLoop, DRAW_INTERVAL);
    };

    this.run = function() {
	if (this.initialize()) {
	    // If initialization was successful, load content
	    this.loadContent();
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
	map.aimBlaster(this.getCanvasCoordinates(location));
    };

    this.handleTouchMove = function(location) {
	map.updateBlasterDirection(this.getCanvasCoordinates(location));
    };

    this.handleTouchEnd = function(location) {
	map.createBlast(this.getCanvasCoordinates(location));
	var entry = this.createLogEntry(this.getCanvasCoordinates(location));
	logBook.push(entry);
    };

    this.getCanvasCoordinates = function(clientLocation) {
	var rect = canvas.getBoundingClientRect();
	var x = clientLocation.x - rect.left;
	var y = clientLocation.y - rect.top;

	return new Position(x, y);
    };

    this.createLogEntry = function(location) {
	var entry = {
	    '_id': logId++,
	    'x': location.x,
	    'y': location.y,
	    'date': new Date()
	};
	return entry;
    };

    this.returnLogBook = function() {
	for (var i = 0; i < logBook.length; i++) {
	    console.log(logBook[i]);
	}
    };

    this.draw = function() {

	// Clear canvas
	canvasBufferContext.clearRect(0, 0, canvas.width, canvas.height);
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);

	// Draw map to buffer
	map.draw(canvasBufferContext);

	// Draw buffer on screen
	canvasContext.drawImage(canvasBuffer, 0, 0);
    };
}
