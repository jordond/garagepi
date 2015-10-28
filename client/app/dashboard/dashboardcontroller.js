(function () {
  'use strict';

  /**
   * @ngdoc object
   * @name dashboard.controller:DashboardCtrl
   *
   * @description
   *
   * Very basic demo of the socket io abilities
   * including a notify callback.
   *
   */
  angular
    .module('app.dashboard')
    .controller('DashboardCtrl', DashboardCtrl);

  /** @ngInject */
  function DashboardCtrl($window, $scope, $http, Socket, Auth, Token) {
    var vm = this;

    vm.awesomeThings = [];

    Auth.isLoggedInAsync()
      .then(function (loggedIn) {
        vm.loggedIn = loggedIn;
      });

    vm.refreshtoken = function () {
      Token.refresh();
    };
  }
}());
