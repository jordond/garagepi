'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GpioSchema = new Schema({
  name: String,
  description: String,
  pin: Number,
  direction: String,
  value: {type: Boolean, default: false}
});

module.exports = mongoose.model('Gpio', GpioSchema);