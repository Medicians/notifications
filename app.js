/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  baucis = require('baucis'),
  mongoose = require('mongoose'),
  _ = require('underscore'),
  swig = require('swig'),
  fs = require('fs'),
  requirejs = require('requirejs'),
  appfog = require('./helpers/appfog'),
  cron = require('./helpers/cron');

var app = express();

app.set('env', process.env.ENV || 'development'); //production

if ((app.get('env') != 'development')) {
  // Minify important resources
  var config = {
    optimize: 'uglify2',
    baseUrl: path.join(__dirname, 'public', 'javascripts'),
    mainConfigFile: path.join(__dirname, 'public', 'javascripts', 'main.js'),
    name: "main",
    generateSourceMaps: false,
    preserveLicenseComments: false,
    out: path.join(__dirname, 'public', 'js', 'main.js'),
  };

  requirejs.optimize(config, function(buildResponse) {
    //var contents = fs.readFileSync(config.out, 'utf8');

    console.info("==> Optimization ready");
  }, function(err) {
    console.error(err);

    process.exit(0);
  });

  var appcache = fs.readFileSync(path.join(__dirname, 'public', 'app.appcache.template'), 'utf8');
  fs.writeFileSync(path.join(__dirname, 'public', 'app.appcache'), appcache.replace('{timestamp}', (new Date).getTime()));
  console.info("Generated new AppCache");
}

var MongoStore = require('connect-mongo')(express);

GLOBAL.salt = 'appians_medical_123454321';

// Template engine
app.engine('html', swig.renderFile);

// all environments
app.set('port', process.env.VMC_APP_PORT || ((app.get('env') == 'development') ? 6001 : 4000));
//app.set('mongo', process.env.MONGO_URL || 'mongodb://localhost/appians_medical');
app.set('mongo', appfog.generate_mongo_url());
app.set('mailgun_key', 'key-8zq2jnqk5eetkyzqel1qdpwvb51um9a6');
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser(salt));
app.use(express.session({
  store: new MongoStore({
    url: app.get('mongo'),
    collection: 'medical_sessions'
  })
}));
app.use(app.router);
app.use(require('less-middleware')({
  src: __dirname + '/public'
}));
app.use(express.static(path.join(__dirname, 'public')));

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

// Put initial data from configuration file for instance
var adminUser = JSON.parse(fs.readFileSync(path.join(__dirname, 'user.json'), 'utf8'));
mongoose.model('User').find({
  email: adminUser.email
}, function(err, docs) {
  if (docs.length == 0) {
    var user = new(mongoose.model('User'))(adminUser);
    user.save(function(err) {
      if (err) {
        console.error(err);
      }

      console.info("Admin user created.");
    });
  }
});

mongoose.model('Config').find({
  email: adminUser.email
}, function(err, docs) {
  if (docs.length == 0) {
    var config = new(mongoose.model('Config'))({
      title: adminUser.firstname + ' ' + adminUser.lastname,
      email: adminUser.email
    });
    config.save(function(err) {
      if (err) {
        console.error(err);
      }

      console.info("Config created.");
    });
  }
});

app.set('server_url', adminUser.server_url);

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

baucis.rest('User');
var calendarController = baucis.rest('Calendar');

calendarController.request('del', function(request, response, next) {
  var moment = require('moment'),
    Mailgun = require('mailgun').Mailgun;

  var mg = new Mailgun(app.get('mailgun_key'));

  mongoose.model('Calendar').findById(request.params.id).populate('user').exec(function(err, cevent) {
    mongoose.model('Config').find({}, function(err, configs) {
      var text = "Estimado " + cevent.user_name + '\n\n';

      text += "Su turno ha sido cancelado: \n";
      text += "Turno cancelado: " + moment(cevent.startTime).format('LLL');

      text += "\n\n" + configs[0].title;

      mg.sendText(configs[0].email, cevent.user.email, 'Cancelación de Turno', text);

      next();
    });
  });
});

baucis.rest('Story');
baucis.rest('Config');
app.use('/api/v1', baucis({
  swagger: true
}));

cron.start();

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
app.post('/login', routes.login);
app.get('/appointment/confirm/:aid', routes.confirm_appointment);

/*
 * Create server
 */
http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});