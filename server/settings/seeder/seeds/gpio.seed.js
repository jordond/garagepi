'use strict';

/**
 * Edit Seed options object, end doExtra function if needed.
 */
var SEED_OPTIONS = {
  modelName: 'gpio',
  data: [{
    name: 'Van',
    input: {
      description: 'Van side open/closed sensor',
      pin: 22,
      edge: 'rising',
      direction: 'in'
    },
    output: {
      description: 'Van side door control',
      pin: 24,
      direction: 'out'
    }
  }, {
    name: 'Car',
    input: {
      description: 'Car side open/closed sensor',
      pin: 25,
      edge: 'rising',
      direction: 'in'
    },
    output: {
      description: 'Car side door control',
      pin: 23,
      direction: 'out'
    }
  }],
  replace: false
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
