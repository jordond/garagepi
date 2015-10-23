/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Gpio = require('./gpio.model');

exports.register = function (socket) {
  Gpio.on('save', onSave);
  Gpio.on('toggle', onToggle);

  function onSave(doc) {
    socket.emit('gpio:save', doc);
  }

  function onToggle(doc) {
    socket.emit('gpio:toggle', doc);
  }

  socket.on('disconnect', function () {
    Gpio.removeListener('save', onSave);
    Gpio.removeListener('toggle', onToggle);
  });
};
