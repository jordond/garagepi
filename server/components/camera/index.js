'use strict';

var fs       = require('fs');
var path     = require('path');
var spawn    = require('child_process').spawn;

var log      = require('../logger/console')('Camera');
var config   = require('../../config').camera;

var fswebcam = require('./fswebcam');
var motion   = require('./motion');

var frameDir     = config.extra.target_dir
  , frameData
  , frameWatcher
  , motion
  , isStreaming  = false;

var imageToWatch = path.join(frameDir, config.filename + '.jpg');

var service = {
  register  : register,
  unregister: unregister
};

module.exports = function () {
  log.log('Initializing camera module');
  fs.stat(frameDir, function (err) {
    if (err) {
      log.info('Creating capture directory [' + frameDir + ']');
      fs.mkdirSync(frameDir);
    }
    log.info('Using [' + frameDir + '] for frame capture');
  });
  return service;
};

/**
 * Public Functions
 */

function register(socket) {
  socket.on('stream:start', function () {
    startStreaming(socket);
  });
}

function unregister(clients) {
  if (clients === 0) {
    stopStreaming();
  }
}

/**
 * Private Helpers
 */

function startStreaming(socket) {
  if (isStreaming) {
    return socket.volatile.emit('frame', frameData);
  }
  log.info('Initializing the frame capture')
  isStreaming = true;
  fswebcam.capture(onCapture);

  function onCapture(wasSuccess) {
    isStreaming = wasSuccess
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
  log.info('Watching file [' + imageToWatch + ']');
  frameWatcher = setInterval(checkFrame, 1000 / config.fps);

  function checkFrame() {
    readFrame(function (wasRead) {
      if (wasRead) {
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