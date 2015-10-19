'use strict';

var logger = {
  console: console
};

function console(tag) {
  return require('./console')(tag);
}

module.exports = logger;