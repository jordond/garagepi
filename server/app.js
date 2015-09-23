/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var TAG = 'App';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');
var gpio = require('./components/gpio');
var log = require('./components/logger/console');

// Kickstart the application
mongoose.connect(config.mongo.uri, config.mongo.options);
log.log(TAG, 'Attempting to connect to [' + config.mongo.uri + ']');

/**
 * Database event handlers
 */

mongoose.connection.on('connected', function () {
  log.log(TAG, 'Connected to ' + config.mongo.uri + ']');
  log.log(TAG, 'Kickstarting server setup');
  setupServer();
});

mongoose.connection.on('error', function (err) {
  log.error('Mongoose', 'Failed to connect to database: ', err.message);
  log.error(TAG, 'Connection to database failed, app will now terminate');
  process.exit(1);
});

mongoose.connection.on('disconnected', function () {
  log.warn('Mongoose', 'Connection to database has been lost');
});

/**
 * Private Helper Methods
 */

function setupServer() {
  var app = express();
  app.set('env', config.env || process.env.NODE_ENV);
  var server = require('http').createServer(app);
  var socketio = require('socket.io')(server, {
    serveClient: (config.env === 'production') ? false : true,
    path: '/socket.io-client'
  });

  app.set('config', config);

  require('./config/socketio')(socketio);
  require('./config/express')(app);

  // Seed database then initalize the gpio class
  if(config.seedDB) {
    require('./settings/seeder').seeder(function () {
      gpio.init();
    });
  } else {
    gpio.init();
  }

  // Setup server routes and start server
  require('./routes')(app, config.secureApi, function () {
    server.listen(config.port, config.ip, function () {
      log.info(TAG, 'Express server listening on port [' + config.port + ']');
      log.info(TAG, 'Environment [' + app.get('env') + ']');
      log.info(TAG, 'Directory   [' + __dirname + ']');
      log.info(TAG, 'Working Dir [' + process.cwd() + ']');
    });
  });

  process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);
  exports = module.exports = app;
}

function gracefulExit() {
  mongoose.connection.close(function () {
    log.log('Mongoose', 'App is terminating, closing connection to database');
    gpio.close();
    process.exit(0);
  });
}
