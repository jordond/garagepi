(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name components.factory:User
   *
   * @description
   *
   */
  angular
    .module('components')
    .factory('User', userConfig);

  /** @ngInject */
  function userConfig($resource) {
    return $resource('api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller: 'password'
        }
      },
      me: {
        method: 'GET',
        params: {
          id: 'me'
        }
      },
      getRoles: {
        method: 'GET',
        params: {
          id: 'roles'
        }
      },
      all: {
        method: 'GET'
      },
      update: {
        method: 'PUT'
      }
    });
  }
}());
