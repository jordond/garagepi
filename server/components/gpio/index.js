'use strict';

var TAG = 'Gpio';

var Gpio = require('onoff').Gpio;
var GpioModel = require('../../api/gpio/gpio.model');
var log = require('../logger/console');

var pins = [];

var service = {
  pins: pins,
  init: initialize,
  toggle: toggle,
  close: close
};

module.exports = service;

/**
 * Public functions
 */

function initialize() {
  GpioModel.find(function (err, gpios) {
    if (err) return handleError(err);
    if (!gpios.length) {
      log.warn(TAG, 'No pins were found');
      return;
    } else {
      gpios.forEach(function (gpio) {
        log.info(TAG, 'Exporting [' + gpio.name + ']');
        setupPins(gpio);
      });
      log.info(TAG, 'Initialization has completed');
    }
  });
}

function toggle(id) {
  pins.forEach(function (pin) {
    if (pin.id === id) {
      log.info(TAG, 'Toggling [' + pin.name + '] door');
      writeOutput(pin.output);
      return true;
    }
  });
  return false;
}

function close() {
  pins.forEach(function (pin) {
    unexportPin(pin.sensor);
    unexportPin(pin.door);
  });
  log.info(TAG, 'Closed [' + pins.length + '] pin pairs');
}

/**
 * Private helpers
 */

function handleError(err) {
  return log.error(TAG, err.message || 'Generic error', err);
}

function setupPins(gpio) {
  var sensor = createPin(gpio.input);
  var door = createPin(gpio.output);
  if (sensor) {
    sensor.read(function (err, value) {
      if (err) return handleError(err);
      log.info(TAG, 'Reading ' + gpio.name + '\'s initial state, value [' + value + ']');
      setSensorStatus(gpio.input, value);
    });
    sensor.watch(function (err, value) {
      if (err) return handleError(err);
      log.info(TAG, gpio.name + ' sensor changed, value [' + value + ']');
      setSensorStatus(gpio.input, value);
    });
  }
  pins.push({
    id: gpio._id,
    name: gpio.name,
    sensor: sensor,
    door: door
  });
}

function createPin(settings, debounce) {
  try {
    var pin = new Gpio(
      settings.pin,
      settings.direction,
      settings.edge || 'none',
      {debounceTimeout: debounce || 100}
    );
    pin.pin = settings.pin;
    log.info(TAG, 'Exported pin #[' + settings.pin + '] direction [' + settings.direction + ']');
    return pin;
  } catch (error) {
    log.error(TAG, 'Failed to export pin #[' + settings.pin +']');
    return false;
  }
}

function setSensorStatus(input, value) {
  input.value = value === 1 ? true : false;
  input.save(function (err) {
    if (err) return handleError(err);
    log.log(TAG, 'Sensor status was saved');
  });
}

function unexportPin(pin) {
  if (pin) {
    pin.unexport();
    log.info(TAG, 'Unexported pin #[' + pin.pin + ']');
  }
}

function writeOutput(output) {
  if (output) {
    output.writeSync(0);
    setTimeout(function() {
      output.writeSync(1);
    }, 200);
  } else {
    log.warn(TAG, 'Output pin isn\'t set, not writing');
  }
}
