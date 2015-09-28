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
    .module('dashboard')
    .controller('DashboardCtrl', DashboardCtrl);

  function DashboardCtrl($window, $scope, $http, Socket, Auth, Token, io) {
    var vm = this;

    vm.awesomeThings = [];

    Auth.isLoggedInAsync()
      .then(function (loggedIn) {
        vm.loggedIn = loggedIn;
      });

    vm.refreshtoken = function () {
      Token.refresh();
    };

    vm.start = function () {
      // RESET TO USING WRAPPER
      vm.socket = io.connect($window.location.origin + '/camera', {
        query: 'token=' + Token.get(),
        path: '/socket.io-client'
      });
      vm.socket.on('connect', function () {
        console.log('connected');
      });
      vm.socket.on('frame', function (data) {
        console.log('recieved frame');
        vm.frame = data;
      });
      vm.socket.on('frame:initial', function (data) {
        console.log('recieved INITIAL frame');
        vm.frame = data;
      });
      vm.socket.on('frame:loading', function () {
        console.log('LOADING FRAME');
      });
    };
    vm.stop = function () {
      vm.socket.disconnect();
      vm.socket = null;
    };
  }
}());
