/**
 * Database Seeder
 * calling `exports.seeder()` will search for all seed files in
 * `./seeds/*.seed.js`
 * It will then call the run() function on each file.
 *
 * seedOption: Is set in your env.js
 */

'use strict';

var fs = require('fs');
var path = require('path');

var log = require('../../components/logger/console');
var config = require('../../config');
var seeder = require('./seeder');

var TAG = 'Seeder';

/**
 * Grabs the filenames of all files in ./seeds/, then passes that
 * information to the ./seeder.js
 */
exports.seeder = function (finished) {
  var normalizedPath = path.join(__dirname, 'seeds');

  var acceptableSeedSettings = [false, true, 'override'];
  if (acceptableSeedSettings.indexOf(config.seedDB) === -1) {
    log.error(TAG, 'Invalid config setting for [seedDB], defaulting to [true]');
    config.seedDB = true;
  }

  var files = fs.readdirSync(normalizedPath);
  var count = 0;

  files.splice(files.indexOf('sample.seed.js'), 1);

  var mode = config.seedDB === 'override' ? config.seedDB : 'normal';
  log.info(TAG, 'Starting Seeder in [' + mode + '] mode');
  log.info(TAG, 'Found [' + files.length + '] Seeds');

  files.forEach(function (file) {
    try {
      seeder.start(file, config, seederCallback);
    } catch (err) {
      log.error(TAG, 'Failed to load seed file [' + file +']', err);
    }
  });

  /**
   * When the ./seeder.js has finished it will call this
   * method with its result
   * @param  {Object} err       Contents of error if seeder got one
   * @param  {String} modelName Name of the model that was seeded
   * @param  {String} message   Message sent back from seeder
   */
  function seederCallback(err, modelName, message) {
    if (err) {
      log.error(TAG, 'Failed to seed [' + modelName + ']', err);
    } else if (message) {
      log.info(TAG, message);
    } else {
      log.info(TAG, 'Finished seeding [' + modelName + ']');
    }
    count++;
    if (count === files.length) {
      log.info(TAG, 'Finished seeding database [' + count + '] seeds');
      finished();
    }
  }
}
