'use strict';

// Use env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  secrets: {
    session: 'replace-me'
  },

  /**
   * Configuation for webcam capture
   * Some defaults, visit link below for more
   * http://www.lavrsen.dk/foswiki/bin/view/Motion/ConfigFileOptions
   */
  // camera: {
  //   configPath: 'server/components/camera/motion.conf',
  //   logPath: '/tmp',
  //   fps: 24,
  //   filename: 'frame',
  //   extra: {
  //     videodevice: '/dev/video0',
  //     target_dir: '/var/tmp/motion',
  //     quality: 60
  //   }
  // }

  /**
   * Console log level
   * ALL - Display all * default for dev
   * DEBUG - Display up-to debug
   * INFO - Display up to info * default for prod
   */
  // log: {
  //   level: 'INFO'
  // },

  /**
   * Port to run the server on
   */
  // port: 5679,

  /**
   * Should I seed the database, [true, false, initial]
   * override = Always seed, ignore the replace flag on seed files. ALWAYS REPLACES
   * true = Always seed, unless seed's `replace` is set to false
   * false = Never seed, ever.
   */
  //seedDB: true,

  /**
   * Secure the API, development defaults to false, production defaults to true
   */
  //secureApi: true,

  /**
   * Default user for first run, please change password after first run
   */
  initialUser: {
    name: 'Administrator',
    username: 'admin',
    email: 'admin@admin.com',
    role: 'admin',
    password: 'admin'
  },

  /**
   * Token settings, default expiry of 3 hours in minutes
   * In hours
   */
  // token: {
  //   expiry: 3
  // },

  /**
   * Database address, and name
   */
  // mongo: {
  //   uri: 'mongodb://10.0.0.2/garagepi-dev'
  // },

  /**
   *  Environment to run, default is environment variables
   */
  //env: 'production',

  /**
   * Control debug level for modules using visionmedia/debug
   */
  DEBUG: ''
};
