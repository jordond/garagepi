'use strict';

var log             = require('../logger/console')('Socket:Camera');
var config          = require('../../config').camera;
var camera          = require('../camera');

var io;
var sockets         = {};
var timeout;

module.exports.init = init;
module.exports.disconnect = onDisconnected;

function init(socketio) {
  io = socketio;
  io.on('connection', onConnection);
  //io.on('disconnect', onDisconnected);
  camera.init(onSend);
  log.info('Initialization completed');
}

function onConnection(socket) {
  socket.on('camera:info', function (data, callback) {
    if (!camera.canStream()) {
      return callback({ready: false, message: 'Device not found'});
    }
    callback({
      ready: true,
      isCapturing: camera.isStreaming(),
      message: 'Ready to stream',
      config: config
    });
  });

  socket.on('camera:start', function () {
    if (!camera.canStream()) {
      onError(socket, 'Server error', 'Video device was not found', {device: config.extra.videodevice});
      return log.error('Not registering streaming, no video device present');
    }
    clearTimeout(timeout);
    sockets[socket.id] = socket;
    if (!camera.isStreaming()) {
      camera.start();
    } else {
      onSend('camera:frame', camera.frame());
    }
  });

  socket.on('camera:stop', function () {
    onDisconnected(socket);
  });
}

function onDisconnected(socket) {
  if (sockets.hasOwnProperty(socket.id)) {
    log.info('Removing client [' + socket.id + ']');
    delete sockets[socket.id];
    log.debug('Remaining clients [' + Object.keys(sockets).length + ']');
    if (Object.keys(sockets).length === 0 && camera.isStreaming()) {
      var delay = (config.shutdownDelay * 1000) * 60;
      log.info('All clients gone, stopping streaming');
      if (delay > 0) {
        log.debug('Delaying stream shutdown by [' + config.shutdownDelay + ' minutes]');
      }
      timeout = setTimeout(camera.stop, delay);
    }
  }
}

function onSend(event, data) {
  if (!event) {
    return log.error('No event was supplied');
  }
  io.emit(event, data);
}

function onError(socket, title, message, info) {
  socket.emit('server:error', {
    title: title,
    message: message,
    info: info
  });
}