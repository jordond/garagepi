'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var _ = require('lodash');
var OnOff = require('onoff').Gpio;

var log = require('../../components/logger').console('GpioModel');

var GPIO_CLOSE = 0
  , GPIO_OPEN = 1
  , GPIO_TOGGLE_TIMEOUT = 300
  , GPIO_DEBOUNCE_DEFAULT = 100;

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
  if (this.type.pair) {
    this.input.gpio = initInput(this);
    this.output.gpio = initOutput(this);
  } else if (this.type.single) {
    this.output.gpio = initOutput(this);
  } else {
    handleError(this, 'Objects input, or output is undefined');
  }
  setupInterval(this);
}

module.exports.Model = Model;

function setupInterval(model) {
  readInput(model, true);
  setInterval(function () {
    readInput(model);
  }, 3000);
};

function initInput(model) {
  var input = createPin(model.input);
  if (!input.error) {
    input.watch(function (err, value) {
      if (err) { return handleError(err, 'Watch pin ' + model.input.pin); }
      log.info(model.name + ' sensor changed, value [' + value + ']');
      setSensorStatus(model, value);
    });
  }
  return input;
}

function readInput(model, force) {
  var oldValue = model.input.value ? 1 : 0;
  model.input.gpio.read(function (err, value) {
    if (force || value !== oldValue) {
      if (err) { return handleError(err, 'Reading pin ' + model.input.pin); }
      log.verbose('Reading ' + model.name + ' sensor\'s initial state, value [' + value + ']');
      setSensorStatus(model, value);
    }
  });
}

function initOutput(model) {
  var output = createPin(model.output);
  if (!output.error) {
    output.write(GPIO_OPEN, function (err) {
      if (err) { return handleError(err, 'Writing pin ' + model.output.pin); }
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
  if (this.output.gpio && !this.output.gpio.error) {
    log.info('Toggling [' + this.name + '] door');
    this.output.gpio.write(GPIO_CLOSE, function (err) {
      if (err) {
        handleError(err, 'Toggle pin ' + self.output.pin);
        callback(err, false);
      }
      setTimeout(function () {
        log.verbose('Inside timeout function writing 1');
        self.output.gpio.write(GPIO_OPEN);
      }, GPIO_TOGGLE_TIMEOUT);
      callback(null, true);
      gpio.emit('toggle', this);
    });
  } else {
    var error = this.output.gpio.error.message || 'Output pin was not exported, see logs';
    log.error('[toggle] ' + error);
    callback(error, false);
  }
};

Model.prototype.close = function () {
  log.verbose('Closing pin [' + this.name + ']');
  gpio.emit('close', this);
  if (this.interval) {
    clearInterval(this.interval);
  }
  unexport(this.input);
  unexport(this.output);
};

Model.prototype.mockSensorChange = function () {
  log.verbose("Mocking the sensor status change");
  this.input.value = !this.input.value;
  gpio.emit('save', this);
};

/**
 * Privates
 */

function createPin(settings) {
  try {
    var pin = new OnOff(
        settings.pin,
        settings.direction,
        settings.edge || 'none',
        { debounceTimeout: settings.debounce || GPIO_DEBOUNCE_DEFAULT }
      );
      log.debug('Exported pin #[' + settings.pin + '] direction [' + settings.direction + ']');
      return pin;
  } catch (err) {
    handleError(err, 'Exporting pin [' + settings.pin + '] failed');
    return { error: { hasError: true, message: err} };
  }
}

function unexport(model) {
  if (model && !model.gpio.error) {
    model.gpio.unexport();
    log.info('Unexported pin [' + model.pin + ']');
  }
}

function handleError(err, message) {
  log.error(message || err.message || 'Generic error');
  return log.debug(err);
}
