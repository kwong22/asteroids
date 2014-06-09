function Game() {

    this.DrawInterval = 50;
    var _map;
    var _canvas;
    var _canvasContext;
    var _canvasBuffer;
    var _canvasBufferContext;

    this.GameLoop = null;

    this.Initialize = function() {

	_map = new Map();

	_canvas = document.getElementById('game-canvas');

	if (_canvas && _canvas.getContext) {
	    
	    _canvasContext = _canvas.getContext('2d');

	    _canvasBuffer = document.createElement('canvas');
	    _canvasBuffer.width = _canvas.width;
	    _canvasBuffer.height = _canvas.height;
	    _canvasBufferContext = _canvasBuffer.getContext('2d');

	    return true;
	}

	return false;
    }

    this.LoadContent = function() {
	
	// Load images

	_map.LoadMap();

	this.GameLoop = setInterval(this.RunGameLoop, this.DrawInterval);
    }

    this.Run = function() {
	if (this.Initialize()) {
	    // If initialization was successful, load content
	    this.LoadContent();
	}
    }

    this.RunGameLoop = function() {
	document.game.Update();
	document.game.Draw();
    }

    this.Update = function() {

	// Handle user input

	_map.Update();
    }
    
    this.Draw = function() {
	
	// Clear canvas
	_canvasBufferContext.clearRect(0, 0, _canvas.width, _canvas.height);
	_canvasContext.clearRect(0, 0, _canvas.width, _canvas.height);

	// Draw map to buffer
	_map.Draw(_canvasBufferContext);

	// Draw buffer on screen
	_canvasContext.drawImage(_canvasBuffer, 0, 0);
    }
}
