var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
app.set('views', __dirname + '/views');
app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));
app.use(express.bodyParser());

app.get('/', function(request, response) {
    response.sendfile(__dirname + '/views/index.html');
});

app.post('/games/end/asteroids', function(req, res) {
    if (!req.body.hasOwnProperty('score')) {
	res.statusCode = 400;
	return res.send({'success': false, 'error': 'Post syntax incorrect'});
    }
    var score = req.body.score;
    console.log(score); // Logged by the Node.js server
    res.send({'success': true});
});

http.createServer(app).listen(app.get('port'), function() {
    console.log("Listening on " + app.get('port'));
});

