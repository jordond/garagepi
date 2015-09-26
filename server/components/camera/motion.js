'use strict';

var fs     = require('fs');
var path   = require('path');
var spawn  = require('child_process').spawn;

var config = require('../../config').camera;
var log    = require('../logger/console')('Motion');

module.exports = function () {
  return new Motion();
}

function Motion() {
  this.process = null;
  this.configWritten = false;
  this.arguments = ['-n', '-c', config.motionConfig];

  var rotateValue = config.cameraRotate;
  if (config.allowedRotate.indexOf(rotateValue) !== -1) {
    log.info('Rotating the frame [' + rotateValue + '°]');
  } else {
    config.extra.rotate = 0;
  }

  writeConfig(function () {
    this.configWritten = true;
  });
}

Motion.prototype.start = function (callback) {
  if (!this.configWritten) {
    log.warn('Config file busy delaying one second...');
    setTimeout(function () { this.start(callback); }, 1000);
  }
  log.info('Spawning process');
  this.process = spawn('motion', this.arguments);
  this.process.stdderr.on('data', onError);
  this.process.on('exit', onExit);

  function onError(data) {
    log.error('stderr: ' + data);
  }

  function onExit(code) {
    if (code !== 0) {
      log.error('Exited with error [' + code + ']');
      return callback(code);
    }
    log.info('Process exited cleanly, motion capture stopped');
  }
};

Motion.prototype.stop = function () {
  log.info('Stopping motion capture process');
  if (this.process) {
    this.process.kill();
    this.process = null;
  }
};

function writeConfig(callback) {
  fs.stat(config.configPath, function (err) {
    if (!err) {
      log.log('Deleting existing config');
      fs.unlinkSync(config.configPath);
    }
    log.info('Writing camera config file');

    var stream = fs.createWriteStream(config.configPath);
    stream.once('open', function (fd) {
      for (var key in config.extra) {
        if (config.extra.hasOwnProperty(key)) {
          stream.write(key + ' ' + config.extra[key]);
        }
      }
      stream.write('picture_filename ' + config.filename);
      stream.write('jpeg_filename ' + config.filename);
      stream.write('snapshot_filename ' + config.filename);
      log.info('Saving camera config file');
      stream.end();
      callback();
    });
  });
}
