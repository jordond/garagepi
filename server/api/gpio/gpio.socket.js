/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Gpio = require('./gpioList');

exports.register = function (socket) {
  Gpio.on('save', function (doc) {
    onSave(socket, doc);
  });
  Gpio.on('toggle', function (doc) {
    onSave(socket, doc);
  });
};

function onSave(socket, doc, cb) {
  socket.emit('gpio:save', doc);
}
