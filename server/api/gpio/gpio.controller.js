'use strict';

var _ = require('lodash');
var Gpio = require('./gpio.interface');

Gpio.init();

/**
 * Grab all of the pin objects
 */
exports.index = function (req, res) {
  Gpio.list.find(function (gpios) {
    return res.status(200).json(gpios);
  });
};

/**
 * Grab the pin id from the params, and toggle it status
 */
exports.toggle = function (req, res) {
  Gpio.list.findById(req.params.id, function (gpio) {
    if (!gpio) { return res.sendStatus(404); }
    Gpio.toggle(gpio, function (toggled) {
      return res.status(200).json({toggled: toggled});
    });
  });
};
