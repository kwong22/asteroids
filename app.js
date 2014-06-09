var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
app.set('views', __dirname + '/views');
app.set('port', process.env.PORT || 8080);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.logger('dev'));

app.get('/', function(request, response) {
    response.sendfile(__dirname + '/views/index.html');
});

http.createServer(app).listen(app.get('port'), function() {
    console.log("Listening on " + app.get('port'));
});
