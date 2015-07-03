'use strict';

/**
 * Edit Seed options object, end doExtra function if needed.
 */
var SEED_OPTIONS = {
  modelName: 'gpio',
  data: [{
    name: 'Van-Door',
    description: 'Van side door control',
    pin: 24,
    direction: 'out'
  }, {
    name: 'Van-Sensor',
    description: 'Van side open/closed sensor',
    pin: 22,
    direction: 'in'
  }, {
    name: 'Car-Door',
    description: 'Car side door control',
    pin: 23,
    direction: 'out'
  }, {
    name: 'Car-Sensor',
    description: 'Car side open/closed sensor',
    pin: 25,
    direction: 'in'
  }],
  replace: true
};

/**
 * Extra things to do before the model is seeded
 */
function preLoad() {
  return;
}

// ============================================================
// Seeder logic - Don't Edit
// ============================================================

exports.load = function () {
  preLoad();
  return SEED_OPTIONS;
}
