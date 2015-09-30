'use strict';

var Gpio = require('onoff').Gpio;
var GpioModel = require('../../api/gpio/gpio.model');
var log = require('../logger/console')('Gpio');

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

/**
 * Setup all of the gpio pins
 * Grabs all 'gpios' from the database, and will export each of them
 * using 'onoff'.
 */
function initialize() {
  GpioModel.find(function (err, gpios) {
    if (err) return handleError(err);
    if (!gpios.length) {
      log.warn('No pins were found');
      return;
    } else {
      gpios.forEach(function (gpio) {
        log.info('Exporting [' + gpio.name + ']');
        setupPins(gpio);
      });
      log.log('Initialization has completed, [' + gpios.length + '] pairs exported');
    }
  });
}

/**
 * Toggle the output gpio from the pin pair
 * @param  {ObjectId}   id     Database id of the pin pair
 * @param  {Function} callback Call when actions finished
 * @return {Function}          The callback
 */
function toggle(id, callback) {
  var toggled = false;
  pins.forEach(function (pin) {
    if (pin.id === id) {
      log.info('Toggling [' + pin.name + '] door');
      writeOutput(pin.door);
      toggled = true;
    }
  });
  return callback(toggled);
}

/**
 * Cleanup all of the exported pins
 */
function close() {
  pins.forEach(function (pin) {
    unexportPin(pin.sensor);
    unexportPin(pin.door);
  });
  log.log('Closed [' + pins.length + '] pin pairs');
}

/**
 * Private helpers
 */

/**
 * Generic error handler
 * @param  {Object} err Error object
 */
function handleError(err) {
  return log.error(err.message || 'Generic error', err);
}

/**
 * Setup the pin pair from the database
 * First export the pin and create the object, if for some reason
 * the exporting failed the returned object will be false
 * For the sensor pin read and save the initial state and setup the watcher
 * For the door pin write an initial on value, as the relay is default closed
 * @param  {Object} gpio Pin pair containing the input and output pins
 */
function setupPins(gpio) {
  var sensor = createPin(gpio.input, 600);
  var door = createPin(gpio.output, 600);
  if (sensor) {
    sensor.read(function (err, value) {
      if (err) return handleError(err);
      log.debug('Reading ' + gpio.name + ' sensor\'s initial state, value [' + value + ']');
      setSensorStatus(gpio.input, value);
    });
    sensor.watch(function (err, value) {
      if (err) return handleError(err);
      log.info(gpio.name + ' sensor changed, value [' + value + ']');
      setSensorStatus(gpio.input, value, true);
    });
  }
  if (door) {
    door.write(1, function (err) {
      if (err) { return handleError(err); }
      log.debug('Writing ' + gpio.name + ' door\'s initial state to on');
    });
  }
  pins.push({
    id: gpio.id,
    name: gpio.name,
    sensor: sensor,
    door: door
  });
}

/**
 * Create the pin object by exporting the pin using 'onoff', using
 * the passed in settings.  If the exporting fails, set the pin object
 * to false.
 * @param  {Object}  settings  Pin export settings
 * @param  {Integer} debounce  Value of the debounce interval
 * @return {Object}            Exported pin object, or false boolean
 */
function createPin(settings, debounce) {
  try {
    var pin = new Gpio(
      settings.pin,
      settings.direction,
      settings.edge || 'none',
      {debounceTimeout: debounce || 100}
    );
    pin.pin = settings.pin;
    log.debug('Exported pin #[' + settings.pin + '] direction [' + settings.direction + ']');
    return pin;
  } catch (error) {
    log.error('Failed to export pin #[' + settings.pin +']');
    return false;
  }
}

/**
 * Save the sensor pins state to the database
 * @param {Object}  input   Sensor database object
 * @param {Integer} value   Current value of the pin
 * @param {Boolean} showLog Display log message
 */
function setSensorStatus(input, value, showLog) {
  input.value = value === 1 ? true : false;
  input.save(function (err) {
    if (err) return handleError(err);
    if (showLog) {
      log.log('Sensor status was saved');
    }
  });
}

/**
 * Unexport the pin to free up the resource
 * @param  {Object} pin Exported pin object
 */
function unexportPin(pin) {
  if (pin) {
    pin.unexport();
    log.info('Unexported pin #[' + pin.pin + ']');
  }
}

/**
 * Toggle the door pin, turn off, wait a bit, then turn
 * the pin back on
 * @param  {Object} output Pin object
 */
function writeOutput(output) {
  if (output) {
    output.write(0, function (err) {
      if (err) { return handleError(err); }
      setTimeout(function() {
        output.write(1);
      }, 200);
    });
  } else {
    log.warn('Output pin isn\'t set, not writing');
  }
}
