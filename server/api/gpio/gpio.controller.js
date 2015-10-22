'use strict';

var _ = require('lodash');
var Gpio = require('./gpioList');

/**
 * Grab all of the pin objects
 */
exports.index = function (req, res) {
  Gpio.find(function (gpios) {
    return res.status(200).json(gpios);
  });
};

/**
 * Grab the pin id from the params, and toggle it status
 */
exports.toggle = function (req, res) {
  Gpio.findById(req.params.id, function (gpio) {
    if (!gpio) { return res.sendStatus(404); }
    gpio.toggle(function (err, toggled) {
      var json = {
        toggled: toggled,
        error: err
      };
      return res.status(toggled ? 200 : 500).json(json);
    });
  });
};
