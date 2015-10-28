'use strict';

/**
 * Default Pins Settings
 * Used for GpioList, isntead of using database
 *
 */

module.exports = [{
    _id: 'van',
    type: { pair: [17, 6] },
    name: 'Van',
    changed: 0,
    input: {
      description: 'Van side open/closed sensor',
      pin: 17,
      edge: 'both',
      direction: 'in',
      debounce: 200
    },
    output: {
      description: 'Van side door control',
      pin: 6,
      direction: 'out',
      debounce: 500
    }
  }, {
    _id: 'car',
    type: { pair: [22, 19] },
    name: 'Car',
    changed: 0,
    input: {
      description: 'Car side open/closed sensor',
      pin: 22,
      edge: 'both',
      direction: 'in',
      debounce: 200
    },
    output: {
      description: 'Car side door control',
      pin: 19,
      direction: 'out',
      debounce: 200
    }
  }, {
    _id: 'led',
    type: { single: 5 },
    name: 'Status LED',
    output: {
      description: 'Displays the status of the server',
      pin: 5,
      direction: 'out'
    }
}];
