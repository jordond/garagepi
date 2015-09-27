'use strict';

var fs     = require('fs');
var path   = require('path');
var spawn  = require('child_process').spawn;

var config = require('../../config').camera;
var log    = require('../logger/console')('Motion');

var logFilename = 'motion.log';

module.exports = function () {
  return new Motion();
}

function Motion() {
  this.process = null;
  this.configWritten = false;
  this.arguments = [
    '-n',
    '-c', config.configPath,
    '-l', logPath()
  ];

  var rotateValue = config.extra.rotate;
  if (config.allowedRotate.indexOf(rotateValue) !== -1) {
    log.info('Rotating the frame [' + rotateValue + '°]');
  } else {
    if (rotateValue !== 0) {
      log.warn('Invalid roatation degree specified [' + rotateValue + '°], defaulting to [0°]');
    }
    config.extra.rotate = 0;
  }

  var that = this;
  writeConfig(function () {
    that.configWritten = true;
    rotateLog(function () {
      log.log('Initialized');
    });
  });
}

Motion.prototype.start = function (callback) {
  if (!this.configWritten) {
    log.warn('Config file busy delaying one second...');
    setTimeout(function () { this.start(callback); }, 1000);
  }
  log.info('Spawning process');
  this.process = spawn('motion', this.arguments);
  this.process.stderr.on('data', onOutput);
  this.process.stdout.on('data', onOutput);
  this.process.on('exit', onExit);

  function onOutput(data) {
    log.log('[Process] ' + data);
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
      log.debug('Deleting existing config');
      fs.unlinkSync(config.configPath);
    }
    log.info('Writing camera config file');
    log.debug('Camera config location [' + config.configPath + ']');

    var stream = fs.createWriteStream(config.configPath);
    stream.once('open', function (fd) {
      log.debug('|=======================================');
      log.debug('| Config options:');
      log.debug('| ---------------');
      for (var key in config.extra) {
        if (config.extra.hasOwnProperty(key)) {
          log.debug('| ' + key + ': ' + config.extra[key]);
          stream.write(key + ' ' + config.extra[key] + '\n');
        }
      }
      stream.write('picture_filename ' + config.filename + '\n');
      stream.write('jpeg_filename ' + config.filename + '\n');
      stream.write('snapshot_filename ' + config.filename);
      log.debug('| frame_filename: ' + config.filename + '.jpg');
      log.debug('|=======================================');
      log.debug('Saved camera config file');
      stream.end();
      callback();
    });
  });
}

function rotateLog(callback) {
  fs.rename(logPath(), logPath() + '.old', function (err) {
    if (!err) {
      log.debug('Rotating [' + logPath() + '.old]');
    }
    log.info('Using [' + logPath() + '] as logfile');
    callback();
  });
}

function logPath() {
  return path.join(config.logPath, logFilename);
}
