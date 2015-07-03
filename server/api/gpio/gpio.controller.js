'use strict';

var _ = require('lodash');
var Gpio = require('./gpio.model');

// Get list of gpios
exports.index = function (req, res) {
  Gpio.find(function (err, gpios) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(gpios);
  });
};

// Get a single gpio
exports.show = function (req, res) {
  Gpio.findById(req.params.id, function (err, gpio) {
    if(err) { return handleError(res, err); }
    if(!gpio) { return res.status(404); }
    return res.status(200).json(gpio);
  });
};

// Creates a new gpio in the DB.
exports.create = function (req, res) {
  Gpio.create(req.body, function (err, gpio) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(gpio);
  });
};

// Updates an existing gpio in the DB.
exports.update = function (req, res) {
  if(req.body._id) { delete req.body._id; }
  Gpio.findById(req.params.id, function (err, gpio) {
    if (err) { return handleError(res, err); }
    if(!gpio) { return res.status(404); }
    var updated = _.merge(gpio, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(gpio);
    });
  });
};

// Deletes a gpio from the DB.
exports.destroy = function (req, res) {
  Gpio.findById(req.params.id, function (err, gpio) {
    if(err) { return handleError(res, err); }
    if(!gpio) { return res.status(404); }
    gpio.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204);
    });
  });
};

function handleError (res, err) {
  return res.status(500).json(err);
}