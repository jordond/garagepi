/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./index');
var passport = require('passport');
var fs = require('fs');

module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(passport.initialize());
  if ('production' === env) {
    var faviconPath = path.join(config.root, 'client', 'favicon.ico');
    fs.stat(faviconPath, function (err, stat) {
      if (err === null) {
        app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
      }
    });
    app.use(express.static(path.join(config.root, 'client')));
    app.use(config.webDir, express.static(path.join(config.client, 'client')));
    app.set('appPath', config.root + '/client');
    app.use(
      morgan('combined', {
        skip: function (req, res) { return res.statusCode < 400; }
      }));
  }
  if ('development' === env || 'test' === env) {
    app.use(express.static(path.join(config.root, 'client')));
    app.use(config.webDir, express.static(path.join(config.client, 'client')));
    app.set('appPath', config.root + '/client');
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};

