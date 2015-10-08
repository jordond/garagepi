(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name resume._-factory:
   *
   * @description
   *
   */
  angular
    .module('underscore')
    .factory('_', _);

  function _($window) {
    return $window._;
  }
}());
