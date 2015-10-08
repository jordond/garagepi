(function () {
  'use strict';

  /**
   * @ngdoc object
   * @name system.controller:SystemSettingsCtrl
   *
   * @description
   *
   */
  angular
    .module('app.system')
    .controller('SystemSettingsCtrl', SystemSettingsCtrl);

  // SystemSettingsCtrl.$inject = [''];

  function SystemSettingsCtrl() {
    var vm = this;
    vm.title = 'SystemSettingsCtrl';
  }
}());
