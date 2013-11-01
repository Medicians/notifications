/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  mongoose = require('mongoose'),
  _ = require('underscore'),
  swig = require('swig'),
  fs = require('fs'),
  appfog = require('./helpers/appfog');

var app = express();

var server = http.createServer(app);

var io = require('socket.io').listen(server);

GLOBAL.salt = 'appians_medical_123454321';

// Template engine
app.engine('html', swig.renderFile);

// all environments
app.set('port', 3001);
app.set('mongo', appfog.generate_mongo_url());

app.set('mailgun_key', 'key-8zq2jnqk5eetkyzqel1qdpwvb51um9a6');

app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(salt));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({
  src: __dirname + '/public'
}));
app.use(express.static(path.join(__dirname, 'public')));

app.set('templates_path', path.join(__dirname, 'views'));

// Disable swig cache
app.set('view cache', false);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Export app
GLOBAL.app = app;

/*
 * Create connection to mongo
 */
mongoose.connect(app.get('mongo'));
var models = require('./models');


app.set('server_url', "http://notifications.medicians.org");

io.sockets.on('connection', function(socket) {
  console.info("Socket connection.");

  app.set('socket', socket);

  socket.on('data', function(data) {

  });
});

/*
 * API
 */

// Enable full CORS
app.all('/api/*', function(req, res, next) {
  req.accepts('*');

  res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
  res.header('Access-Control-Allow-Credentials', 'true');

  // Add security layer checking if user is auth based on a token composed by _id + pass

  next();
});

app.all('/login', function(req, res, next) {
  req.accepts('*');

  res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
  res.header('Access-Control-Allow-Credentials', 'true');

  next();
});

/*
 * Auth
 */

// Just for ajax calls

function ensureSession(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect('/');
  }
};

/*
 * URLS
 */
app.get('/', routes.index);
app.post('/send_email', routes.send_email);
app.post('/send_short_message', routes.send_short_message);

/*
 * Create server
 */
server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});