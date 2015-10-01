'use strict';

var fs       = require('fs');
var path     = require('path');
var spawn    = require('child_process').spawn;

var log      = require('../logger/console')('Camera');
var config   = require('../../config').camera;

var fswebcam;
var motion;

var sendFrame
  , frameDir     = config.extra.target_dir
  , frameData
  , frameWatcher
  , canStream    = true
  , isStreaming  = false;

var imageToWatch = path.join(frameDir, config.filename + '.jpg');

var service = {
  init       : init,
  canStream  : getCanStream,
  isStreaming: getIsStreaming,
  frame: getFrame,
  start      : startStreaming,
  stop       : stopStreaming
};

module.exports = service;

/**
 * Public Functions
 */

function init(callback) {
  log.log('Initializing camera module');
  sendFrame = callback;

  fs.stat(config.extra.videodevice, function (err) {
    if (err) {
      log.error('Video device [' + config.extra.videodevice + '] not found')
      log.error('Skipping camera setup, add device and restart');
      canStream = false;
    } else {
      fswebcam = require('./fswebcam')();
      motion = require('./motion')();
      fs.stat(frameDir, onDirStat);
    }
  });

  process
    .on('SIGINT', stopStreaming)
    .on('SIGTERM', stopStreaming)
    .on('exit', stopStreaming);

  function onDirStat(err) {
    if (err) {
      log.info('Creating capture directory [' + frameDir + ']');
      fs.mkdirSync(frameDir);
    }
    log.info('Using [' + frameDir + '] for frame capture');
  }
}

function getCanStream() { return canStream; }

function getIsStreaming() { return isStreaming; }

function getFrame() { return frameData; }

/**
 * Private Helpers
 */

function startStreaming() {
  if (!canStream) { return; }
  log.info('Initializing the frame capture')
  isStreaming = true;
  fswebcam.capture(onCapture);

  function onCapture(wasSuccess) {
    isStreaming = wasSuccess;
    if (wasSuccess) {
      readFrame(function (wasRead) {
        sendFrame('camera:initial', frameData);
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
  sendFrame('camera:loading');
  motion.start(function (errorCode) {
    if (!errorCode) { return; }
    log.error('Motion encountered an error [' + errorCode + ']');
    log.error('Stopping all camera activity');
    stopWatcher();
  });
  startWatcher();
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
        sendFrame('camera:frame', frameData);
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