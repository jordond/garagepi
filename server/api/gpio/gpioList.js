'use strict';

var _ = require('lodash');

var Gpio = require('./gpio.model');
var pins = require('../../settings/pins');
var log = require('../../components/logger/').console('Gpio');

/**
 * @constuctor GpioList
 * Contains a list of all the gpio models, inherits from
 * eventemitter so it can broadcast events
 */
function GpioList() {
  var gpios = [];
  pins.forEach(function (value) {
    log.info('Exporting [' + value.name + ']');
    var model = new Gpio.Model(value);
    gpios.push(model);
  });
  this.gpios = gpios;
}

/**
 * Get the array of pins
 * @param {Function} fn callback
 * @return callback
 */
GpioList.prototype.find = function (fn) {
  return fn(this.gpios);
};

/**
 * Find a pin object by it's id
 * @param {String} id identifier
 * @param {Function} fn callback
 * @return callback
 */
GpioList.prototype.findById = function (id, fn) {
  var gpio = _.findWhere(this.gpios, { _id: id });
  fn(gpio);
};

/**
 * Close all of the exported gpio objects
 */
GpioList.prototype.close = function () {
  this.gpios.forEach(function (gpio) {
    gpio.close();
  });
};

module.exports = new GpioList();
