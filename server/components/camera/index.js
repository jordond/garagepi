'use strict';

var fs       = require('fs');
var path     = require('path');
var spawn    = require('child_process').spawn;

var log      = require('../logger/console')('Camera');
var config   = require('../../config').camera;

var fswebcam = require('./fswebcam')();
var motion   = require('./motion')();

var sockets      = {}
  , frameDir     = config.extra.target_dir
  , frameData
  , frameWatcher
  , canStream    = true
  , isStreaming  = false;

var imageToWatch = path.join(frameDir, config.filename + '.jpg');

var service = {
  init      : init,
  canStream : canStream,
  register  : register,
  unregister: unregister
};

module.exports = service;

/**
 * Public Functions
 */

function init(callback) {
  log.log('Initializing camera module');
  fs.stat(config.extra.videodevice, function (err) {
    if (err) {
      log.error('Video device [' + config.extra.videodevice + '] not found')
      canStream = false;
      return callback(err, 'Not found');
    }
    fs.stat(frameDir, onDirStat);
  });

  function onDirStat(err) {
    if (err) {
      log.info('Creating capture directory [' + frameDir + ']');
      fs.mkdirSync(frameDir);
    }
    log.info('Using [' + frameDir + '] for frame capture');
  }
}

function register(socket) {
  if (!canStream) {
    log.warn('Not registering streaming, no video device present');
    return;
  }
  sockets[socket.id] = socket;
  socket.on('stream:start', function (id) {
    startStreaming(sockets[id]);
  });
  socket.on('stream:pause', function (id) {
    if (sockets.hasOwnProperty(id)) {
      sockets[id].paused = true;
    }
  });
}

function unregister(socket) {
  removeClient(socket.id);
}

/**
 * Private Helpers
 */

function removeClient(id) {
  if (!id) {
    return log.error('[remove] No socket id was supplied');
  } else if (sockets.hasOwnProperty(id)) {
    log.info('Removing client [' + id + ']');
    delete sockets[id];
    if (Object.keys(sockets).length === 0 && isStreaming) {
      log.info('All clients gone, stopping streaming');
      stopStreaming();
    }
  }
}

function startStreaming(socket) {
  if (!socket) {
    return log.error('[start] No socket was supplied');
  } else if (isStreaming) {
    log.info('[start] Already streaming, sending last frame');
    return socket.volatile.emit('frame', frameData);
  }
  log.info('Initializing the frame capture')
  isStreaming = true;
  fswebcam.capture(onCapture);

  function onCapture(wasSuccess) {
    isStreaming = wasSuccess;
    if (wasSuccess) {
      readFrame(function (wasRead) {
        log.info('Emitting initial frame');
        socket.volatile.emit('frame:initial', frameData);
      });
      startMotionCapture(socket);
    }
  }
}

function stopStreaming() {
  isStreaming = false;
  frameData = null;
  motion.stop();
  stopWatcher();
}

function startMotionCapture(socket) {
  log.log('Starting motion capture process');
  socket.emit('frame:loading');
  motion.start(function (errorCode) {
    if (!errorCode) { return; }
    log.error('Motion encountered an error [' + errorCode + ']');
    log.error('Stopping all camera activity');
    stopWatcher(socket);
  });
  startWatcher(socket);
}

function readFrame(callback) {
  fs.readFile(imageToWatch, function (err, data) {
    if (!err) {
      data = data.toString('base64');
      if (frameData !== data) {
        frameData = data;
        callback(true);
      }
    } else {
      callback(false);
    }
  });
}

function startWatcher(socket) {
  var fps = config.fps;
  if (fps > 30 || fps <= 0) {
    log.warn('FPS of [' + fps + '] not valid [1-30], defaulting to [24]');
    fps = 24;
  }
  log.info('Watching file [' + imageToWatch + ']');
  log.info('Streaming camera at [' + fps + 'fps]');
  frameWatcher = setInterval(onInterval, 1000 / fps);

  function onInterval() {
    readFrame(function (wasRead) {
      if (wasRead && !socket.paused) {
        socket.volatile.emit('frame', frameData);
      }
    });
  }
}

function stopWatcher() {
  if (frameWatcher) {
    clearInterval(frameWatcher);
    frameWatcher = null;
    log.info('Stopping the frame watcher');
  }
}