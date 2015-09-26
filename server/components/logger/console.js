'use strict';

var moment = require('moment');

module.exports = function (tag) {
  tag = tag !== '' ? 'App' : tag;
  return new Logger(tag);
};

function Logger(tag) {
  this.tag = '[' + tag + '] ';
}

Logger.prototype.error = function (message, data) {
  this.toLog('error', message, data);
};

Logger.prototype.info = function (message, data) {
  this.toLog('info ', message, data);
};

Logger.prototype.warn = function (message, data) {
  this.toLog('warn ', message, data);
};

Logger.prototype.debug = function (message, data) {
  this.toLog('debug', message, data);
};

Logger.prototype.log = function (message, data) {
  this.toLog('log  ', message, data);
};

Logger.prototype.setTag = function (tag) {
  this.tag = '[' + tag + '] ';
};

Logger.prototype.toLog = function (type, message, data) {
  type = '[' + type.toUpperCase() + ']';
  data = data ? data : '';
  console.log(timestamp() + type + this.tag + message + data);
}

/**
 * Private Helpers
 */

function timestamp() {
  return '[' + moment().format('YYYY/DD/MM HH:mm:ss') + ']';
}
