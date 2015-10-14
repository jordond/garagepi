'use strict';

var _ = require('lodash');
var Gpio = require('./gpio.model');
var gpioControl = require('../../components/gpio');

/**
 * Grab all of the pin objects
 */
exports.index = function (req, res) {
  Gpio.find(function (err, gpios) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(gpios);
  });
};

/**
 * Grab the pin id from the params, and toggle it status
 */
exports.toggle = function (req, res) {
  Gpio.findById(req.params.id, function (err, gpio) {
    if (err) { return handleError(res, err); }
    if (!gpio) { return res.sendStatus(404); }
    gpioControl.toggle(gpio, function (toggled) {
      return res.status(200).json({toggled: toggled});
    });
  });
};

function handleError(res, err) {
  return res.status(500).json(err);
}