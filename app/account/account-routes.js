(function () {
  'use strict';

  angular
    .module('account')
    .config(config);

  function config($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'account/login/login.tpl.html',
        controller: 'LoginCtrl',
        controllerAs: 'vm',
        role: 'guest'
      })
      .state('logout', {
        url: '/logout',
        template: '<div ng-init="vm.logout()"></div>',
        controller: 'LogoutCtrl',
        controllerAs: 'vm',
        role: 'guest'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'account/settings/settings.tpl.html',
        controller: 'SettingsCtrl',
        controllerAs: 'vm'
      })
      .state('profile', {
        url: '/profile',
        templateUrl: 'account/profile/profile.tpl.html',
        controller: 'ProfileCtrl',
        controllerAs: 'vm',
        role: 'user'
      });
  }
}());
