'use strict';

var _ = require('lodash');
var log = require('../../components/logger').console('GpioModel');

/**
 * Constructor, attatch event emitter and merge the
 * settings object
 * @param {Object} settings contains default pin settings
 */
function Gpio(settings, callback) {
  _.extend(this, settings);
  this.callback =  callback || function() { return true; };
}

/**
 * Prototypes
 */

Gpio.prototype.save = function () {
  this.changed++;
  log.verbose('VALUE (save): ' + this.input.value);
  this.callback('save', this);
  log.verbose('GPIO Pin [' + this.name + '] was saved::Count [' + this.changed + ']');
};

Gpio.prototype.toggle = function () {
  if (this.output) {
    this.output.toggled++;
    this.callback('toggle', this);
    log.verbose('GPIO Pin [' + this.name + '] was toggled::Count [' + this.output.changed + ']');
  } else {
    log.warn('Could not toggle GPIO Pin [' + this.name + ']');
  }
};

module.exports = Gpio;
