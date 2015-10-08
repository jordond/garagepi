(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name app.factory:authInterceptor
   *
   * @description
   *
   */
  angular
    .module('app')
    .factory('authInterceptor', authInterceptor);

  authInterceptor.$injector = ['$rootScope', '$q', '$injector'];

  function authInterceptor($rootScope, $q, $injector) {
    var Token = {}
      , Auth = {}
      , logger = {}
      , service = {};

    service = {
      request: request,
      responseError: responseError
    };

    return service;

    function request(config) {
      Token = $injector.get('Token');
      config.headers = config.headers || {};
      if (Token.has()) {
        config.headers.Authorization = 'Bearer ' + Token.get();
      }
      return config;
    }

    function responseError(response) {
      Auth = $injector.get('Auth');
      logger = $injector.get('logger');
      if (response.status === 401) {
        logger.warning('You have been logged out', '', 'Forbidden');
        Auth.logout();
      } else if (response.status === 0) {
        logger.error('Can\'t reach the server, try refreshing...', '', 'Server Error');
      }
      return $q.reject(response);
    }
  }
}());
