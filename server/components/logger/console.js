'use strict';

var moment = require('moment');

module.exports = {
  error: function (tag, message, data) {
    data = data ? data : '';
    console.error(timestamp() + '[ERROR][' + tag + '] ' + message, data);
  },

  info: function (tag, message, data) {
    data = data ? data : '';
    console.error(timestamp() + '[INFO ][' + tag + '] ' + message, data);
  },

  warn: function (tag, message, data) {
    data = data ? data : '';
    console.error(timestamp() + '[WARN ][' + tag + '] ' + message, data);
  },

  debug: function (tag, message, data) {
    data = data ? data : '';
    console.error(timestamp() + '[DEBUG][' + tag + '] ' + message, data);
  },

  log: function (tag, message, data) {
    data = data ? data : '';
    console.error(timestamp() + '[LOG  ][' + tag + '] ' + message, data);
  },
};

function timestamp() {
  return '[' + moment().format('YYYY/DD/MM HH:mm:ss') + ']';
}
