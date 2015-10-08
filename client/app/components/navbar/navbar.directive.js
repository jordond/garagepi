(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.directive:navbar
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('components')
    .directive('navbar', navbar);

  function navbar() {
    return {
      restrict: 'EA',
      scope: {},
      templateUrl: 'app/components/navbar/navbar.tpl.html',
      replace: true,
      controllerAs: 'vm',
      controller: function () {
        var vm = this;
        vm.name = 'Navbar';
      }
    };
  }
}());
