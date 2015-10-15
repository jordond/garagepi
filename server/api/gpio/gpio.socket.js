/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Gpio = require('./gpio.model');

exports.register = function (socket) {
  Gpio.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Gpio.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
};

function onSave(socket, doc, cb) {
  socket.emit('gpio:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('gpio:remove', doc);
}