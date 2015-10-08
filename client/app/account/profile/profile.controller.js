(function () {
  'use strict';

  /**
   * @ngdoc object
   * @name account.controller:ProfileCtrl
   *
   * @description
   *
   */
  angular
    .module('app.account')
    .controller('ProfileCtrl', ProfileCtrl);

  ProfileCtrl.$injector = ['profilePrepService'];

  function ProfileCtrl(profilePrepService) {
    var vm = this;

    vm.user = profilePrepService;
    vm.copy = angular.copy(vm.user);
    vm.updateCallback = updateCallback;

    function updateCallback(success, response) {
      if (success) {
        vm.copy = angular.copy(response);
      } else {
        vm.user = angular.copy(vm.copy);
      }
    }
  }
}());
