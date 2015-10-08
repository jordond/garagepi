'use strict';

var logger = {
  console: console
};

module.exports = logger;

function console(tag) {
  return require('./console')(tag);
}