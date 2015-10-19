/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var GpioList = require('./gpio.interface').list;

exports.register = function (socket) {
  GpioList.on('save', function (doc) {
    onSave(socket, doc);
  });
  GpioList.on('toggle', function (doc) {
    onSave(socket, doc);
  });
};

function onSave(socket, doc, cb) {
  socket.emit('gpio:save', doc);
}
