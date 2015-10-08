(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name app.constant:roles
   *
   * @description
   *
   */
  angular
    .module('app')
    .value('roles', roles);

  function roles() {
    return ['guest', 'user', 'admin'];
  }
}());
