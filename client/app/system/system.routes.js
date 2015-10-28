(function () {
  'use strict';

  angular
    .module('app.system')
    .config(config);

  /** @ngInject */
  function config($stateProvider) {
    $stateProvider
      .state('system', {
        url: '/system',
        abstract: true,
        templateUrl: 'app/system/system.tpl.html',
        role: 'admin'
      })
      .state('system.settings', {
        url: '',
        templateUrl: 'app/system/settings/settings.tpl.html',
        controller: 'SystemSettingsCtrl',
        controllerAs: 'vm',
        role: 'admin'
      });
  }
}());
