(function () {
  'use strict';

  angular
    .module('app.system.users')
    .config(config);

  /** @ngInject */
  function config($stateProvider) {
    $stateProvider
      .state('system.users', {
        url: '/users',
        templateUrl: 'app/system/users/users.tpl.html',
        controller: 'UsersCtrl',
        controllerAs: 'vm',
        role: 'admin',
        resolve: {
          usersPrepService: usersPrepService
        }
      })
      .state('system.users.create', {
        url: '/create',
        templateUrl: 'app/system/users/user/user.tpl.html',
        controller: 'UserCtrl',
        controllerAs: 'vm',
        role: 'admin',
        resolve: {
          userPrepService: userPrepService
        }
      })
      .state('system.users.edit', {
        url: '/edit/:userId',
        templateUrl: 'app/system/users/user/user.tpl.html',
        controller: 'UserCtrl',
        controllerAs: 'vm',
        role: 'admin',
        resolve: {
          userPrepService: userPrepService
        }
      });
  }

  usersPrepService.$inject = ['UserSocket'];
  function usersPrepService(UserSocket) {
    return UserSocket.activate();
  }

  userPrepService.$inject = ['$state', '$stateParams', 'UserData'];
  function userPrepService($state, $stateParams, UserData) {
    var id = $stateParams.userId;
    if (!id) {
      return undefined;
    }
    return UserData.find(id)
      .catch(function () {
        $state.go('system');
      });
  }
}());
