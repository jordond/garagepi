'use strict';

var moment = require('moment');

var config;

module.exports = function (tag) {
  config = require('../../config/index');
  tag = tag === '' ? 'App' : tag;
  return new Logger(tag);
};

function Logger(tag) {
  this.tag = '[' + tag + '] ';
}

Logger.prototype.verbose = function (message, data) {
  this.toLog('verbose', message, data);
}

Logger.prototype.debug = function (message, data) {
  this.toLog('debug', message, data);
};

Logger.prototype.info = function (message, data) {
  this.toLog('info ', message, data);
};

Logger.prototype.warn = function (message, data) {
  this.toLog('warn ', message, data);
};

Logger.prototype.error = function (message, data) {
  this.toLog('error', message, data);
};

Logger.prototype.log = function (message, data) {
  this.toLog('log  ', message, data);
};

Logger.prototype.setTag = function (tag) {
  this.tag = '[' + tag + '] ';
};

Logger.prototype.toLog = function (type, message, data) {
  if (canOutput(type)) {
    type = '[' + type.toUpperCase() + ']';
    data = data ? data : '';
    console.log(timestamp() + type + this.tag + message + data);
  }
}

/**
 * Private Helpers
 */

function canOutput(outLevel) {
  outLevel = outLevel.trim();
  var level = config.logLevel.toUpperCase();
  var levelIndex = config.logLevels.indexOf(level);
  var outIndex = config.logLevels.indexOf(outLevel.toUpperCase());
  if (outIndex >= levelIndex && levelIndex !== -1) {
    return true;
  }
  // When the user entered loglevel is invalid
  return outIndex >= config.logLevels.indexOf('INFO');
}

function timestamp() {
  return '[' + moment().format('YYYY/DD/MM HH:mm:ss') + ']';
}
