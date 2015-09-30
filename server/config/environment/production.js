'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.IP ||
            undefined,

  // Server port
  port:     process.env.PORT ||
            80,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGO_URL ||
            'mongodb://localhost/garagepi'
  },

  log: {
    level: 'INFO',
    short: true
  },

  secureApi: true,

  camera: {
    shutdownDelay: 5
  },

  token: {
    expiry: 158
  },

  seedDB: true
};