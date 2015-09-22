'use strict';

/**
 * Seed options schema
 */
// {
//   modelName: 'name of the model',
//   data: {field: ''},
//   replace: 'Whether or not to delete the items each time',
//   callback: function ()
// }

//================================================
// Main Seeding Logic
//================================================

var glob = require('glob');

/**
 * @public
 * Load the x.seed.js file, grab its configuration
 * Then attempt to load the corresponding mongoose model,
 * if all is well, then run the seeder.
 * @param  {String}   file     Path to seed file
 * @param  {Object}   config   App configuration
 * @param  {Function} callback Relay status of seed
 * @return {null}              nothing
 */
exports.start = function (file, config, callback) {
  var Model, modelConfig;
  try {
    var pattern;
    modelConfig = require('./seeds/' + file).load();
    modelConfig.seedMode = config.seedDB;
    modelConfig.callback = callback;

    pattern = config.api + '/**/' + modelConfig.modelName + '.model.js';
    glob(pattern, function (err, files) {
      if (err) {throw err;}

      Model = require(files[0]);
      modelConfig.Model = Model;
      seed(modelConfig);
    });
  } catch (err) {
    throw err;
  }
  return;
}

/**
 * Private methods
 */

/**
 * @private
 * Decide whether or not to seed the specific model
 * depends on if documents exists, and the replace flag
 * for model is true.
 * @param  {Object} config Model configuration
 * @return {null}          nothing
 */
function seed(config) {
  config.Model.find({}, function (err, docs) {
    if (err) {
      config.callback(err, config.modelName);
      return;
    }
    if (config.seedMode) {
      if (docs.length > 0) {
        if (config.replace || config.seedMode === 'override') {
          config.Model.remove(docs, function () {
            create(config);
          });
        } else {
          config.callback(null, config.modelName, 'Skipping [' + config.modelName + '] documents exist');
        }
      } else {
        create(config);
      }
    }
    return;
  });
}

/**
 * @private
 * The actual seeder, create the documents in the database
 * @param  {Object} config All the model config
 */
function create(config) {
  config.Model.create(config.data, function (err) {
    config.callback(err, config.modelName);
  });
}
