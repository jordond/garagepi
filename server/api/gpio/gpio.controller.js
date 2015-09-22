'use strict';

var _ = require('lodash');
var Gpio = require('./gpio.model');
var gpioControl = require('../../components/gpio');

// Get list of gpios
exports.index = function (req, res) {
  Gpio.find(function (err, gpios) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(gpios);
  });
};

exports.toggle = function (req, res) {
  Gpio.findById(req.params.id, function (err, gpio) {
    if (err) { return handleError(res, err); }
    if (!gpio) { return res.sendStatus(404); }
    gpioControl.toggle(req.params.id, function (toggled) {
      return res.status(200).json({toggled: toggled});
    });
  });
};

function handleError (res, err) {
  return res.status(500).json(err);
}