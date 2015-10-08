(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.directive:logout
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('app.account')
    .directive('logout', logout);

  function logout() {
    return {
      restrict: 'EA',
      scope: {},
      template: '<i class="fa fa-power-off" ng-click="vm.logout()"></>',
      replace: false,
      controllerAs: 'vm',
      controller: 'LogoutCtrl'
    };
  }
}());
