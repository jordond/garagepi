'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GpioSchema = new Schema({
  name: String,
  input: {
    description: String,
    pin: Number,
    direction: String,
    edge: String,
    value: {type: Boolean, default: false}
  },
  output: {
    description: String,
    pin: Number,
    direction: String,
    edge: String,
    value: {type: Boolean, default: false}
  }
});

module.exports = mongoose.model('Gpio', GpioSchema);