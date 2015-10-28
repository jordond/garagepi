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

  /** @ngInject */
  function io($window) {
    return $window.io;
  }
}());
