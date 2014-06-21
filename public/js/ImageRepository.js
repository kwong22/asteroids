function ImageRepository() {
    var parsed = {
	'ship': {
	    'src': 'img/ship_28x28-01.png',
	    'w': 28,
	    'h': 28
	},
	'bg': {
	    'src': 'img/background_300x400-01.png',
	    'w': 300,
	    'h': 400
	},
	'blast': {
	    'src': 'img/blast_4x16-01.png',
	    'w': 4,
	    'h': 16
	},
	'asteroid': {
	    'src': 'img/asteroid_12x12-01.png',
	    'w': 12,
	    'h': 12
	}
    };

    this.sprites = [];

    this.defSprite = function(name, img, w, h, cx, cy) {
	var sprite = {
	    'name': name,
	    'img': img,
	    'w': w,
	    'h': h,
	    'cx': cx,
	    'cy': cy
	};
	this.sprites[name] = sprite;
    };

    var imgLoaded = 0;
    this.loaded = function() {
	return imgLoaded == Object.keys(parsed).length;
    };

    this.loadContent = function() {
	imgLoaded = 0;

	for (var key in parsed) { // key is the name of the asset
	    var sprite = parsed[key];
	    // Define center of sprite as an offset, just add it to drawImage function to make image position at the center
	    var cx = -sprite.w * 0.5;
	    var cy = -sprite.h * 0.5;
	    var img = new Image();
	    img.src = sprite.src;
	    img.onload = function() {
		imgLoaded++;
	    };
	    this.defSprite(key, img, sprite.w, sprite.h, cx, cy);
	}
    };
}
