(function () {
  'use strict';

  angular
    .module('app.account')
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
      .state('profile', {
        url: '/profile',
        templateUrl: 'account/profile/profile.tpl.html',
        controller: 'ProfileCtrl',
        controllerAs: 'vm',
        role: 'user',
        resolve: {
          profilePrepService: profilePrepService
        }
      })
      .state('settings', {
        url: '/settings',
        templateUrl: 'account/settings/settings.tpl.html',
        controller: 'UserSettingsCtrl',
        controllerAs: 'vm',
        role: 'user',
        resolve: {
          profilePrepService: profilePrepService
        }
      });
  }

  profilePrepService.$inject = ['Auth'];
  function profilePrepService(Auth) {
    return Auth.getUserAsync();
  }
}());
