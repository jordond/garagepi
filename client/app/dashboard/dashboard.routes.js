(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .config(config);

  /** @ngInject */
  function config($stateProvider) {
    $stateProvider
      .state('dashboard', {
        url: '/',
        templateUrl: 'app/dashboard/dashboard.tpl.html',
        controller: 'DashboardCtrl',
        controllerAs: 'vm'
      });
  }
}());
