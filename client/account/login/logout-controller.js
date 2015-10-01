(function () {
  'use strict';

  /**
   * @ngdoc object
   * @name account.controller:LogoutCtrl
   *
   * @description
   *
   */
  angular
    .module('app.account')
    .controller('LogoutCtrl', LogoutCtrl);

  function LogoutCtrl($state, Auth) {
    var vm = this;

    function logout() {
      Auth.logout();
    }

    vm.logout = logout;
  }
}());
