'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var _ = require('lodash');
var OnOff = require('onoff').Gpio;

var log = require('../../components/logger').console('GpioModel');

var OUTPUT_CLOSE = 0;
var OUTPUT_OPEN = 1;

/**
 * Constructor, attatch event emitter
 */
function Gpio() {
  EventEmitter.call(this);
}

util.inherits(Gpio, EventEmitter);

var gpio = module.exports = new Gpio();

/////////////////

function Model(settings) {
  _.extend(this, settings);

  // Initialization
  if (this.input && this.output) {
    this.input.gpio = initInput(this);
    this.output.gpio = initOutput(this);
  } else {
    handleError(this, 'Objects input, or output is undefined');
  }
  //return this;
}

module.exports.Model = Model;

function initInput(model) {
  var input = createPin(model.input);
  if (input) {
    input.read(function (err, value) {
    if (err) { return handleError(err); }
      log.debug('Reading ' + model.name + ' sensor\'s initial state, value [' + value + ']');
      setSensorStatus(model, value);
    });
    input.watch(function (err, value) {
      if (err) { return handleError(err); }
      log.info(model.name + ' sensor changed, value [' + value + ']');
      setSensorStatus(model, value);
    });
  }
  return input;
}

function initOutput(model) {
  var output = createPin(model.output, 600);
  if (output) {
    output.write(1, function (err) {
      if (err) { return handleError(err); }
      log.debug('Writing ' + model.name + ' door\'s initial state to on');
    });
  }
  return output;
}

function setSensorStatus(model, value) {
  model.input.value = value === 1 ? true : false;
  gpio.emit('save', model);
  log.verbose('GPIO Sensor [' + model.name + '] was saved');
}

/**
 * Prototypes
 */

Model.prototype.toggle = function (callback) {
  var self = this;
  if (this.output.gpio) {
    log.info('Toggling [' + this.name + '] door');
    this.output.gpio.write(OUTPUT_CLOSE, function (err) {
      if (err) {
        handleError(err);
        callback(err, false);
      }
      setTimeout(function() {
        self.output.gpio.write(OUTPUT_OPEN);
      }, 200);
      callback(null, true);
      gpio.emit('toggle', this);
    });
  } else {
    var error = 'Output pin was not exported, see logs';
    log.warn(error);
    callback(error, false);
  }
};

Model.prototype.close = function () {
  this.emit('close', this);
  unexport(this.input.gpio);
  unexport(this.output.gpio);
};

/**
 * Privates
 */

function createPin(settings, debounce) {
  try {
    var pin = new OnOff(
        settings.pin,
        settings.deirection,
        settings.edge || 'none',
        { debounceTimeout: debounce || 100 }
      );
      log.debug('Exported pin #[' + settings.pin + '] direction [' + settings.direction + ']');
      return pin;
  } catch (err) {
    handleError(err);
    return false;
  }
}

function unexport(gpio) {
  if (gpio) {
    gpio.unexport();
    log.info('Unexported pin #[' + gpio + ']');
  }
}

function handleError(err, message) {
  log.error(message || err.message || 'Generic error');
  return log.debug(err);
}
