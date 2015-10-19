'use strict';

/**
 * Edit Seed options object, end doExtra function if needed.
 */
var SEED_OPTIONS = {
  modelName: '',
  data: [{
    field1: '',
    field2: ''
  }, {
    field1: '',
    field2: ''
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
};
