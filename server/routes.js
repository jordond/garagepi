/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var auth = require('./auth/auth.service');
var debug = require('./components/errors/error.controller');
var log = require('./components/logger/console');

module.exports = function(app, secureApi) {
  // Lock down api
  if (secureApi) {
    app.use('/api', auth.isAuthenticated());
  } else {
    displayInsecureWarning();
  }

  // Insert routes below
  app.use('/api/gpios', require('./api/gpio'));
  app.use('/api/settings', require('./api/setting'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));

  app.get('/debug/error/', debug.index);
  app.get('/debug/error/:code', debug.returnError);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|vendor|assets|fonts|images)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};

function displayInsecureWarning() {
  log.warn('Routes', '=======================================')
  log.warn('Routes', '=  RUNNING WITH API IN INSECURE MODE  =');
  if (process.env.NODE_ENV === 'production') {
  log.warn('Routes', '= NO AUTHENTICATION REQUIRED FOR API  =');
  log.warn('Routes', '= SET secureApi IN env.js!            =');
  }
  log.warn('Routes', '=Ignore this warning if it is intended=')
  log.warn('Routes', '=======================================');
}
