'use strict';

var path = require('path');
var fs = require('fs');
var log = require('../components/logger/console');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../..'),

  client: path.normalize(__dirname +'/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'replace-me'
  },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

};

// Export the config object based on the NODE_ENV
all = _.merge(all, require('./environment/' + process.env.NODE_ENV + '.js') || {});

// Export the config object for local env
// ==============================================
if (fs.existsSync(all.root + '/env.js')) {
  all = _.merge(all, require(all.root + '/env.js'));
} else {
  log.error('Config', 'CONFIG FILE NOT FOUND, USING DEFAULTS (UNSAFE)');
  log.error('Config', 'Seriously, its only okay for development!');
}

module.exports = all;