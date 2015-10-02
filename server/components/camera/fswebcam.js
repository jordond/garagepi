'use strict';

var fs     = require('fs');
var path   = require('path');
var spawn  = require('child_process').spawn;

var config = require('../../config').camera;
var log    = require('../logger/console')('FSWebcam');

module.exports = function (filename) {
  filename = filename ? filename :
    path.join(config.extra.target_dir, config.filename + '.jpg');
  return new FSWebcam(filename);
}

function FSWebcam(filename) {
  this.process = null;
  this.arguments = [
    '-q',
    '-d', config.extra.videodevice,
    '-r', config.extra.width + 'x' + config.extra.height,
    '--no-banner'
  ];

  var rotateValue = config.extra.rotate;
  if (config.allowedRotate.indexOf(rotateValue) !== -1) {
    log.info('Rotating the frame [' + rotateValue + '°]');
    this.arguments.push('--rotate');
    this.arguments.push(rotateValue);
  } else {
    if (rotateValue !== 0) {
      log.warn('Ignoring invalid rotation degree specified [' + rotateValue + '°]');
    }
  }
  this.arguments.push(filename);
  log.log('Initialized');
}

FSWebcam.prototype.capture = function (callback) {
  log.info('Spawning process');
  this.process = spawn('fswebcam', this.arguments);
  this.process.stderr.on('data', onError);
  this.process.on('exit', onExit);

  function onError(data) {
    log.error('[stderr]: ' + data);
  }

  function onExit(code) {
    if (code !== 0) {
      log.error('Exited with error [' + code + ']');
      return callback(false);
    }
    log.info('Intial frame capture was a success, code [' + code + ']');
    return callback(true);
  }
};
