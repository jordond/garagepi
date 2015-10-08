(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name components.io-factory:
   *
   * @description
   *
   */
  angular
    .module('components')
    .factory('io', io);

  function io($window) {
    return $window.io;
  }
}());
