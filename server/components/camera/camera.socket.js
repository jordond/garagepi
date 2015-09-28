'use strict';

var log = require('../logger/console')('Socket:Camera');
var camera = require('../camera');

var io;
var sockets = {};

module.exports.init = init;

function init(socketio) {
  io = socketio;
  io.on('connection', onConnection);
  io.on('disconnect', onDisconnected);
  camera.init(onSend);
  log.info('Initialization completed');
}

function onConnection(socket) {
  if (!camera.canStream()) {
    return log.error('Not registering streaming, no video device present');
  }
  sockets[socket.id] = socket;
  socket.on('start-stream', function () {
    if (!camera.isStreaming()) {
      camera.start();
    } else {
      onSend('frame', camera.frame());
    }
  });
}

function onDisconnected(socket) {
  if (sockets.hasOwnProperty(socket.id)) {
    log.info('Removing client [' + socket.id + ']');
    delete sockets[socket.id];
    log.debug('Remaining clients [' + Object.keys(sockets).length + ']');
    if (Object.keys(sockets).length === 0 && camera.isStreaming()) {
      log.info('All clients gone, stopping streaming');
      camera.stop();
    }
  }
}

function onSend(event, data) {
  if (!event) {
    return log.error('No event was supplied');
  }
  io.emit(event, data);
}