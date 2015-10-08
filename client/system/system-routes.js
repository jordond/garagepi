(function () {
  'use strict';

  angular
    .module('app.system')
    .config(config);

  function config($stateProvider) {
    $stateProvider
      .state('system', {
        url: '/system',
        abstract: true,
        templateUrl: 'system/system.tpl.html',
        role: 'admin'
      })
      .state('system.settings', {
        url: '',
        templateUrl: 'system/settings/settings.tpl.html',
        controller: 'SystemSettingsCtrl',
        controllerAs: 'vm',
        role: 'admin'
      });
  }
}());
