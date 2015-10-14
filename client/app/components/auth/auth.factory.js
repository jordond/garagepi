(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name components.factory:Auth
   *
   * @description
   *
   */
  angular
    .module('components')
    .factory('Auth', Auth);

  Auth.$inject = ['$http', '$location', '$q', '$state', 'User', 'AuthEvent', 'Token', 'logger'];

  function Auth($http, $location, $q, $state, User, AuthEvent, Token, logger) {
    var currentUser = {}
      , roles = []
      , service;

    service = {
      login          : login,
      logout         : logout,
      roles          : getRoles,
      revoke         : revoke,
      getSelf        : getSelf,
      getUser        : getUser,
      getUserAsync   : getUserAsync,
      getToken       : getToken,
      getCurrentRole : getCurrentRole,
      setUser        : setCurrentUser,
      isAdmin        : isAdmin,
      isLoggedIn     : isLoggedIn,
      isLoggedInAsync: isLoggedInAsync
    };

    return service;

    /**
     * Public Methods
     */

    /**
     * Attempt to log the given user in
     * @param  {object} user Contains the email and password
     * @return {promise}     Take action once resolved
     */
    function login(user) {
      return $http.post('/auth/local', {
          email: user.email,
          password: user.password
        })
        .then(loginSuccess)
        .catch(loginFailed);

      function loginSuccess(response) {
        Token.store(response.data.token);
        currentUser = response.data.user;
        AuthEvent.authenticated();
        $location.path('/');
        return response.data.token;
      }

      function loginFailed(error) {
        logger.error(error.data.message, error, 'Login failed');
        $state.go('login');
        return $q.reject(error.data.message);
      }
    }

    /**
     * Log the user out by removing the token
     */
    function logout() {
      if (Token.has()) {
        $http.get('/auth/logout')
          .then(function () {
            AuthEvent.deauthenticated();
            currentUser = {};
            $state.go('login');
          });
      }
    }

    /**
     * Grab the current logged in user
     * @return {Object} Current user
     */
    function getSelf() {
      currentUser = User.me()
        .$promise
        .then(success)
        .catch(failed);

      return currentUser;

      function success(response) {
        currentUser = response.data;
        if (response.newToken) {
          Token.store(response.newtoken);
          logger.log('Auth', 'Updated token');
        }
        return response.data;
      }

      function failed(error) {
        return $q.reject(error.message);
      }
    }

    /**
     * Get the supported user roles
     * @return {Array} List of all the accepted roles
     */
    function getRoles() {
      if (roles.length > 0) {
        return $q.when(roles);
      }
      return User.getRoles()
        .$promise
        .then(userRolesSuccess)
        .catch(userRolesFailed);

      function userRolesSuccess(response) {
        roles = response.data;
        return roles;
      }

      function userRolesFailed(error) {
        logger.error('Failed to grab roles', error);
        return $q.reject(error.data);
      }
    }

    function revoke(id) {
      return $http.put('/auth/revoke', {id: id})
        .then(revokeSuccess)
        .catch(revokeFailed);

      function revokeSuccess(response) {
        AuthEvent.revoke(id);
        logger.info(response.data.message);
        return response;
      }

      function revokeFailed(error) {
        logger.error('Failed to revoke auth token', error);
        return $q.reject(error);
      }
    }

    /**
     * Synchronous Getters
     */

    function getUser() {
      return currentUser;
    }

    function getToken() {
      return Token.get();
    }

    function getCurrentRole() {
      return currentUser.role;
    }

    function isAdmin() {
      return currentUser.role === 'admin';
    }

    function isLoggedIn() {
      return currentUser.hasOwnProperty('role');
    }

    /**
     * Synchronous Setters
     */

    /**
     * Update the current user
     * @param {Object} user new user object
     */
    function setCurrentUser(user) {
      currentUser = user;
    }

    /**
     * Async Getters
     */

    /**
     * Get the currently logged in user
     * @return {object} Logged in user
     */
    function getUserAsync() {
      return $q.when(currentUser);
    }

    /**
     * Creates a promise out of the currentUser object
     * preforms check once it is resolved
     * @return {Boolean} Logged in status
     */
    function isLoggedInAsync() {
      return $q.when(currentUser)
        .then(function (user) {
          if (user.hasOwnProperty('role')) {
            return true;
          }
          return false;
        });
    }
  }
}());
