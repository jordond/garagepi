'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/garagepi-dev'
  },

  logLevel: 'ALL',

  // API WILL NOT REQUIRE AUTHENTICATION
  secureApi: false,

  seedDB: true
};
