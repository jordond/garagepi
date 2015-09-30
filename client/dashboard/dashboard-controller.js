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

    vm.start = function () {
      Socket.emit('camera:start', Socket.id);
      Socket.on('camera:frame', function (data) {
        console.log('recieved frame');
        vm.frameOld = vm.frame;
        vm.frame = data;
      });
      Socket.on('camera:initial', function (data) {
        console.log('recieved INITIAL frame');
        vm.frame = data;
      });
      Socket.on('camera:loading', function () {
        console.log('LOADING FRAME');
      });
    };

    vm.stop = function () {
      Socket.emit('camera:stop', Socket.id);
      Socket.remove('camera:frame');
      Socket.remove('camera:initial');
      Socket.remove('camera:loading');
    };
  }
}());
