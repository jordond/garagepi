/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');

var config = require('./config');
var log = require('./components/logger').console('App');

var isExiting = false;

// Check logger level
var level = config.log.level.toUpperCase();
if (config.log.levels.indexOf(level) === -1) {
  log.warn('Ignoring invalid log level');
  level = config.log.default;
}
log.log('Using log level [' + level + ']');

// Kickstart the application
mongoose.connect(config.mongo.uri, config.mongo.options);
log.log('Attempting to connect to [' + config.mongo.uri + ']');

/**
 * Database event handlers
 */

mongoose.connection.on('connected', function () {
  log.log('Connected to ' + config.mongo.uri + ']');
  log.log('Kickstarting server setup');

  mongoose.connection.on('disconnected', function () {
    log.warn('Connection to database has been lost');
    finish(1, 'Could not connect to database at [' + config.mongo.uri + ']');
  });

  setupServer();
});

mongoose.connection.on('error', function (err) {
  log.error('Failed to connect to database: ', err.message);
  log.error('Connection to database failed, app will now terminate');
  finish(1, err);
});

/**
 * Private Helper Methods
 */

function setupServer() {
  var app = express();
  app.set('env', config.env || process.env.NODE_ENV);
  var server = require('http').createServer(app);
  var socketio = require('socket.io')(server, {
    serveClient: (config.env === 'production') ? true : true,
    path: '/sync'
  });

  app.set('config', config);

  require('./config/socketio')(socketio);
  require('./config/express')(app);

  // Seed database then initalize the gpio class
  if(config.seedDB) {
    require('./settings/seeder').seeder();
  }

  // Setup server routes and start server
  require('./routes')(app, config.secureApi, function () {
    server.listen(config.port, config.ip, function () {
      log.log('Express server listening on port [' + config.port + ']');
      log.log('Environment [' + app.get('env') + ']');
      log.log('Directory   [' + __dirname + ']');
      log.log('Working Dir [' + process.cwd() + ']');
    });
  });

  process
    .on('SIGINT', gracefulExit)
    .on('SIGTERM', gracefulExit);

  exports = module.exports = app;
}

function gracefulExit() {
  log.log('Triggering application shutdown');
  mongoose.connection.removeAllListeners('disconnected');
  mongoose.connection.close(function () {
    log.log('Closing connection to the database');
    finish(0);
  });
}

function finish(code, err) {
  if (isExiting) {
    return;
  }
  var message = 'Node is about to exit with code [' + code + ']';
  if (code === 0) {
    log.log(message);
  } else {
    log.warn(message);
    log.error('Error: ' + err);
  }
  process.exit(code);
}
