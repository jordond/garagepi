(function () {
  'use strict';

  /**
   * @ngdoc filter
   * @name components.filter:null-date
   *
   * @description
   *
   * @param {Array} input The array to filter
   * @returns {Array} The filtered array
   *
   */
  angular
    .module('components')
    .filter('nullDate', nullDate);

  function nullDate() {
    return function (input, text) {
      return input ? input : text;
    };
  }
}());
