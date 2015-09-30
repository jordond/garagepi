'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/garagepi-dev'
  },

  log: {
    level: 'DEBUG'
  },

  // API WILL NOT REQUIRE AUTHENTICATION
  secureApi: false,

  camera: {
    shutdownDelay: 1
  },

  seedDB: true
};
