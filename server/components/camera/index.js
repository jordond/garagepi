'use strict';

var fs       = require('fs');
var path     = require('path');
var spawn    = require('child_process').spawn;

var log      = require('../logger').console('Camera');
var config   = require('../../config').camera;

var fswebcam;
var motion;

var emit
  , frameDir     = config.extra.target_dir
  , frameData
  , frameWatcher
  , pollSpeed = config.devicePolling > 30 ? config.devicePolling : 30
  , cameraCheck
  , canStream    = false
  , isStreaming  = false
  , currentlyReading = false;

var imageToWatch = path.join(frameDir, config.filename + '.jpg');

var service = {
  init       : init,
  canStream  : getCanStream,
  isStreaming: getIsStreaming,
  frame      : getFrame,
  start      : startStreaming,
  stop       : stopStreaming
};

module.exports = service;

/**
 * Public Functions
 */

function init(callback) {
  log.log('Initializing camera module');
  log.info('Setting video device poller to [' + pollSpeed + '] seconds');
  emit = callback;

  setupCamera();
  cameraCheck = setInterval(setupCamera, pollSpeed * 1000);

  process
    .on('SIGINT', stopStreaming)
    .on('SIGTERM', stopStreaming)
    .on('exit', stopStreaming);
}

function getCanStream() { return canStream; }

function getIsStreaming() { return isStreaming; }

function getFrame() { return frameData; }

/**
 * Private Helpers
 */

function setupCamera() {
  checkCamera(function (exists) {
    if (exists) {
      if (!canStream) {
        fswebcam = require('./fswebcam')();
        motion = require('./motion')();
        fs.stat(frameDir, onDirStat);
        canStream = true;
      }
    } else {
      log.error('Video device [' + config.extra.videodevice + '] not found');
      log.info('Connect device, next check in [' + pollSpeed + '] seconds');
      if (canStream) {
        emit('camera:error', {
          error: {
            hasError: true,
            message: 'Video device not found'
          },
          ready: false,
          config: config
        });
      }
      canStream = false;
    }
  });

  function onDirStat(err) {
    if (err) {
      log.info('Creating capture directory [' + frameDir + ']');
      fs.mkdirSync(frameDir);
    }
    log.info('Using [' + frameDir + '] for frame capture');
  }
}

function checkCamera(callback) {
  fs.stat(config.extra.videodevice, function (err) {
    callback(err ? false : true);
  });
}

function startStreaming() {
  if (!canStream) { return; }
  log.info('Initializing the frame capture');
  isStreaming = true;
  fswebcam.capture(onCapture);

  function onCapture(wasSuccess) {
    isStreaming = wasSuccess;
    if (wasSuccess) {
      readFrame(function (wasRead) {
        emit('camera:initial', frameData);
      });
      startMotionCapture();
    }
  }
}

function stopStreaming() {
  if (isStreaming) {
    isStreaming = false;
    frameData = null;
    motion.stop();
    stopWatcher();
  }
}

function startMotionCapture() {
  log.log('Starting motion capture process');
  emit('camera:loading');
  motion.start(function (errorCode) {
    if (!errorCode) { return; }
    log.error('Motion encountered an error [' + errorCode + ']');
    log.error('Stopping all camera activity');
    stopWatcher();
  });
  startWatcher();
}

function readFrame(callback) {
  if (!currentlyReading) {
    currentlyReading = true;
    fs.readFile(imageToWatch, function (err, data) {
      if (!err) {
        var frame = data.toString('base64');
        if (frameData !== frame) {
          frameData = frame;
          callback(true);
        }
      } else {
        callback(false);
      }
      currentlyReading = false;
    });
  }
}

function startWatcher() {
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
      if (wasRead) {
        emit('camera:frame', frameData);
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