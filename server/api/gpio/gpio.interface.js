'use strict';

var Gpio = require('onoff').Gpio;
var GpioList = require('./gpioList');
var log = require('../../components/logger/').console('Gpio');

var pins = [];
var wasError = false;
var errors = 0;

var service = {
  list: GpioList,
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
  GpioList.find(function (gpios) {
    if (!gpios.length) {
      log.warn('No pins were found');
      return;
    } else {
      gpios.forEach(function (gpio) {
        log.info('Exporting [' + gpio.name + ']');
        setupPins(gpio);
      });
      if (wasError) {
        return log.warn('Initialization has completed, with [' + errors + '] errors');
      }
      log.log('Initialization has completed, [' + gpios.length + '] pairs exported');
    }
  });
}

/**
 * Toggle the output gpio from the pin pair
 * @param  {Object}   pin      Pin object
 * @param  {Function} callback Call when actions finished
 * @return {Function}          The callback
 */
function toggle(pin, callback) {
  log.info('Toggling [' + pin.name + '] door');
  writeOutput(pin.door, callback);
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
function handleError(err, message) {
  wasError = true;
  errors++;
  log.error(message || err.message || 'Generic error');
  return log.debug(err);
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
  var sensor = createPin(gpio.input, 100);
  var door = createPin(gpio.output, 600);
  if (sensor) {
    sensor.read(function (err, value) {
      if (err) { return handleError(err); }
      log.debug('Reading ' + gpio.name + ' sensor\'s initial state, value [' + value + ']');
      setSensorStatus(gpio, value);
    });
    sensor.watch(function (err, value) {
      if (err) { return handleError(err); }
      log.info(gpio.name + ' sensor changed, value [' + value + ']');
      setSensorStatus(gpio, value);
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
    handleError(error, 'Failed to export pin #[' + settings.pin +']');
    return false;
  }
}

/**
 * Save the sensor pins state to the database
 * @param {Object}  gpio   Sensor database object
 * @param {Integer} value   Current value of the pin
 */
function setSensorStatus(gpio, value) {
  gpio.input.value = value === 1 ? true : false;
  log.verbose('VALUE: ' + value);
  gpio.save();
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
 * @param {Function} callback send toggled status
 */
function writeOutput(output, callback) {
  if (output) {
    output.write(0, function (err) {
      if (err) {
        handleError(err);
        callback(err, false);
      }
      setTimeout(function() {
        output.write(1);
      }, 200);
      callback(null, true);
    });
  } else {
    var error = 'Output pin was not exported, see logs';
    log.warn(error);
    callback(error, false);
  }
}
