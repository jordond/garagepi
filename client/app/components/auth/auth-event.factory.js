(function () {
  'use strict';

  /**
   * @ngdoc factory
   * @name components.service:AuthEvent
   *
   * @description
   *
   */
  angular
    .module('components')
    .factory('AuthEvent', AuthEventConfig);

  AuthEventConfig.$injector = ['$rootScope'];

  function AuthEventConfig($rootScope) {
    var service = {
      authenticated  : authenticated,
      refresh        : refresh,
      revoke         : revoke,
      deauthenticated: deauthenticated,
      onAuth         : onAuth,
      onRefresh      : onRefresh,
      onRevoke       : onRevoke,
      onDeauth       : onDeauth
    };

    return service;

    /**
     * Public Methods
     */

    function authenticated(args) {
      $rootScope.$broadcast('auth:authenticated', args);
    }

    function refresh(args) {
      $rootScope.$broadcast('auth:refreshed', args);
    }

    function revoke(id) {
      $rootScope.$broadcast('revoked:' + id);
    }

    function deauthenticated(args) {
      $rootScope.$broadcast('auth:deauthenticated', args);
    }

    function onAuth(callback) {
      $rootScope.$on('auth:authenticated', callback);
    }

    function onRefresh(callback) {
      $rootScope.$on('auth:refreshed', callback);
    }

    function onRevoke(id, callback) {
      $rootScope.$on('revoked:' + id, callback);
    }

    function onDeauth(callback) {
      $rootScope.$on('auth:deauthenticated', callback);
    }
  }
}());
