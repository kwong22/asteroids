function Game() {

    this.FPS = 60;
    this.DRAW_INTERVAL = 1000 / this.FPS;
    var inputManager_ = new InputManager;
    var map_;
    var imageRepository_;
    var canvas_;
    var canvasContext_;
    var canvasBuffer_;
    var canvasBufferContext_;

    this.gameLoop = null;

    this.initialize = function() {
	
	inputManager_.on('touchStart', document.game.handleTouchStart.bind(this));
	inputManager_.on('touchMove', document.game.handleTouchMove.bind(this));
	inputManager_.on('touchEnd', document.game.handleTouchEnd.bind(this));

	imageRepository_ = new ImageRepository();
	map_ = new Map(imageRepository_);

	canvas_ = document.getElementById('game-canvas');

	if (canvas_ && canvas_.getContext) {
	    
	    canvasContext_ = canvas_.getContext('2d');

	    canvasBuffer_ = document.createElement('canvas');
	    canvasBuffer_.width = canvas_.width;
	    canvasBuffer_.height = canvas_.height;
	    canvasBufferContext_ = canvasBuffer_.getContext('2d');

	    return true;
	}

	return false;
    };

    this.loadContent = function() {

	// Load images
	imageRepository_.loadContent();
	map_.loadMap();

	this.gameLoop = setInterval(this.runGameLoop, this.DRAW_INTERVAL);
    };

    this.run = function() {
	if (this.initialize()) {
	    // If initialization was successful, load content
	    this.loadContent();
	}
    };

    this.runGameLoop = function() {
	if (map_.isLoaded && imageRepository_.loaded()) {
	    document.game.update();
	    document.game.draw();
	}
    };

    this.update = function() {

	// Handle user input

	map_.update();
    };
    
    this.handleTouchStart = function(location) {
	map_.aimBlaster(this.getCanvasCoordinates(location));
    };

    this.handleTouchMove = function(location) {
	map_.updateBlasterDirection(this.getCanvasCoordinates(location));
    };

    this.handleTouchEnd = function(location) {
	map_.createBlast(this.getCanvasCoordinates(location));
    };

    this.getCanvasCoordinates = function(clientLocation) {
	var rect = canvas_.getBoundingClientRect();
	var x = clientLocation.x - rect.left;
	var y = clientLocation.y - rect.top;

	return new Position(x, y);
    };

    this.draw = function() {
	
	// Clear canvas
	canvasBufferContext_.clearRect(0, 0, canvas_.width, canvas_.height);
	canvasContext_.clearRect(0, 0, canvas_.width, canvas_.height);

	// Draw map to buffer
	map_.draw(canvasBufferContext_);

	// Draw buffer on screen
	canvasContext_.drawImage(canvasBuffer_, 0, 0);
    };
}
