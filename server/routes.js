/**
 * Main application routes
 */

'use strict';

var TAG = 'Routes';

var glob = require('glob');
var path = require('path');

var config = require('./config');
var errors = require('./components/errors');
var auth = require('./auth/auth.service');
var log = require('./components/logger/console');

var debug = require('./components/errors/error.controller');

module.exports = function(app, secureApi, callback) {
  if (secureApi) {
    app.use('/api', auth.isAuthenticated());
  } else {
    displayInsecureWarning();
  }
  registerApiRoutes(app, callback);

  app.use('/auth', require('./auth'));

  app.get('/debug/error/', debug.index);
  app.get('/debug/error/:code', debug.returnError);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|vendor|assets|fonts|images)/*')
   .get(errors[404]);

  app.route('/api')
    .get(function (req, res) {
      res.status(200).json('Reached API');
    });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(app.get('appPath') + '/index.html');
    });
};

/**
 * Find all of the api routes in '/server/api/<route>/index.js'
 */
function registerApiRoutes(app, callback) {
  var pattern = config.api + '/**/index.js';
  glob(pattern, function (err, files) {
    if (err) { return log.error(TAG, 'Error finding route files', err); }
    log.info(TAG, 'Found [' + files.length +'] routes');
    files.forEach(function (file) {
      var folders = path.dirname(file).split(path.sep);
      var name = folders[folders.length - 1] + 's';
      app.use('/api/' + name, require(file));
      log.info(TAG, 'Registered api route [/api/' + name + ']');
    });
    callback();
  });
}

function displayInsecureWarning() {
  log.warn('Routes', '=========================================')
  log.warn('Routes', '=   RUNNING WITH API IN INSECURE MODE   =');
  if (process.env.NODE_ENV === 'production') {
    log.warn('Routes', '=  NO AUTHENTICATION REQUIRED FOR API   =');
    log.warn('Routes', '=       SET secureApi IN env.js!        =');
  }
  log.warn('Routes', '= Ignore this warning if it is intended =')
  log.warn('Routes', '=========================================');
}
