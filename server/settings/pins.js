'use strict';

/**
 * Default Pins Settings
 * Used for GpioList, isntead of using database
 *
 */

module.exports = [{
  _id: 'van',
  name: 'Van',
  changed: 0,
  input: {
    description: 'Van side open/closed sensor',
    pin: 22,
    edge: 'both',
    direction: 'in',
  },
  output: {
    toggled: 0,
    description: 'Van side door control',
    pin: 24,
    direction: 'out'
  }
}, {
  _id: 'car',
  name: 'Car',
  changed: 0,
  input: {
    description: 'Car side open/closed sensor',
    pin: 25,
    edge: 'both',
    direction: 'in'
  },
  output: {
    toggled: 0,
    description: 'Car side door control',
    pin: 23,
    direction: 'out'
  }
}];
