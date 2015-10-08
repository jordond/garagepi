(function () {
  'use strict';

  /**
   * @ngdoc object
   * @name account.controller:UserSettingsCtrl
   *
   * @description
   *
   */
  angular
    .module('app.account')
    .controller('UserSettingsCtrl', UserSettingsCtrl);

  UserSettingsCtrl.$injector = ['profilePrepService'];

  function UserSettingsCtrl(profilePrepService) {
    var vm = this
      , user = profilePrepService;

    vm.settings = angular.copy(user.settings);
    vm.copy = angular.copy(user.settings);
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
