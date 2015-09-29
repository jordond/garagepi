'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.IP ||
            undefined,

  // Server port
  port:     process.env.PORT ||
            5679,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGO_URL ||
            'mongodb://localhost/garagepi'
  },

  logLevel: 'INFO',

  secureApi: true,

  camera: {
    shutdownDelay: 5
  },

  token: {
    expiry: 158 * 60
  },

  seedDB: true
};