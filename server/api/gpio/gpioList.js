'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var GpioModel = require('./gpio.model');
var pins = require('../../settings/pins');

function GpioList() {
  EventEmitter.call(this);

  var gpios = [], that = this;
  pins.forEach(function (value) {
    var model = new GpioModel(value, onEvent);
    gpios.push(model);
  });
  this.gpios = gpios;

  function onEvent(event, model) {
    console.log('GPIOLIST SAVE: ' + model.input.value);
    that.emit(event, model);
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
  var gpio;
  this.gpios.forEach(function (value) {
    if (value.id === id) {
      gpio = value;
    }
  });
  return fn(gpio);
};

module.exports = new GpioList();