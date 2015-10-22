'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');

var GpioModel = require('./gpio.model');
var pins = require('../../settings/pins');
var log = require('../../components/logger/').console('Gpio');

var gpioList = new GpioList();

module.exports = gpioList;

function GpioList() {
  EventEmitter.call(this);

  var gpios = [], self = this;
  pins.forEach(function (value) {
    log.info('Exporting [' + value.name + ']');
    var model = new GpioModel(value, self.emit);
    gpios.push(model);
  });
  this.gpios = gpios;

  var self = this;
  function onEvent(event, model) {
    console.log(self);
    self.emit(event, model);
  }
}

util.inherits(GpioList, EventEmitter);

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
