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

  function DashboardCtrl($scope, $http, Socket, Auth, Token) {
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
      Socket.wrapper.emit('stream:start', Socket.id);
      Socket.wrapper.on('frame', function (data) {
        console.log('recieved frame');
        vm.frame = data;
      });
      Socket.wrapper.on('frame:initial', function (data) {
        console.log('recieved INITIAL frame');
        vm.frame = data;
      });
      Socket.wrapper.on('frame:loading', function () {
        console.log('LOADING FRAME');
      });
    };
    vm.stop = function () {
      Socket.wrapper.emit('stream:pause', Socket.id);
    };
  }
}());
