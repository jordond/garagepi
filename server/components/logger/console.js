'use strict';

var chalk = require('chalk');
var moment = require('moment');

var config;

module.exports = function (tag) {
  config = require('../../config/index').log;
  tag = tag === '' ? 'App' : tag;
  return new Logger(tag);
};

function Logger(tag) {
  this.tag = '[' + tag + '] ';
}

Logger.prototype.verbose = function (message, data) {
  this.toLog('verbose', message, data);
};

Logger.prototype.debug = function (message, data) {
  var bg = chalk.magenta;
  this.toLog('debug  ', message, data, bg, bg, bg);
};

Logger.prototype.info = function (message, data) {
  var bg = chalk.cyan;
  this.toLog('info   ', message, data, bg, bg, bg);
};

Logger.prototype.warn = function (message, data) {
  var type = chalk.bold.bgYellow;
  var bg = chalk.bold.yellow;
  this.toLog('warn   ', message, data, type, bg, bg);
};

Logger.prototype.error = function (message, data) {
  var type = chalk.bold.bgRed;
  var bg = chalk.bold.red;
  this.toLog('error  ', message, data, type, bg, bg);
};

Logger.prototype.log = function (message, data) {
  var bg = chalk.green;
  this.toLog('log    ', message, data, bg, bg, bg);
};

Logger.prototype.setTag = function (tag) {
  this.tag = '[' + tag + '] ';
};

Logger.prototype.toLog = function (type, message, data, tyCol, tagCol, msgCol) {
  if (canOutput(type)) {
    if (config.short) {
      type = type.charAt(0);
    }
    type = '[' + type.toUpperCase() + ']';
    data = data ? data : '';
    if (tyCol && tagCol && msgCol) {
      console.log(chalk.dim(timestamp()) + tyCol(type) + tagCol(this.tag) + msgCol(message) + data);
    } else {
      console.log(chalk.dim(timestamp()) + type + this.tag + message + data);
    }
  }
};

/**
 * Private Helpers
 */

function canOutput(outLevel) {
  outLevel = outLevel.trim();
  var level = config.level.toUpperCase();
  var levelIndex = config.levels.indexOf(level);
  var outIndex = config.levels.indexOf(outLevel.toUpperCase());
  if (outIndex >= levelIndex && levelIndex !== -1) {
    return true;
  }
  // When the user entered loglevel is invalid
  if (levelIndex === -1) {
    return outIndex >= config.levels.indexOf(config.default);
  }
  return false;
}

function timestamp() {
  return '[' + moment().format('YYYY/DD/MM HH:mm:ss') + ']';
}
