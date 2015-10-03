(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name components.service:token
   *
   * @description
   *
   */
  angular
    .module('components')
    .service('Token', Token);

  Token.$inject = ['$cookieStore', '$q', '$interval', '$timeout', '$http', 'logger', 'AuthEvent'];

  function Token($cookieStore, $q, $interval, $timeout, $http, logger, AuthEvent) {
    var TAG = 'Token'
      , self = this
      , activeToken = $cookieStore.get('token')
      , timeout
      , refresher;

    /**
     * Public Members
     */

    self.get        = get;
    self.has        = has;
    self.refresh    = refresh;
    self.store      = store;
    self.remove     = remove;
    self.activate   = activate;
    self.deactivate = deactivate;
    self.destroy    = destroy;

    /**
     * Listeners
     */

    AuthEvent.onAuth(function (event, refreshNow) {
      activate(refreshNow);
    });
    AuthEvent.onDeauth(destroy);

    /**
     * Public Methods
     */

    /**
     * @public get
     * Accessor for the token
     * @return {String} User's JWT
     */
    function get() {
      return activeToken;
    }

    /**
     * @public has
     * Check to see whether or not the token exists
     * @return {Boolean} Existence of token
     */
    function has() {
      if (angular.isUndefined(activeToken) || activeToken === '') {
        return false;
      }
      return true;
    }

    /**
     * @public refresh
     * Manually refresh the token
     * @return {Promise} Contains status of token refresh
     */
    function refresh() {
      return $q.when(refreshToken());
    }

    /**
     * @public store
     * Place the token into cookie storage
     * @param  {String} token User JWT
     */
    function store(token) {
      activeToken = token;
      $cookieStore.put('token', token);
    }

    /**
     * @public remove
     * Remove the token from the cookie storage
     */
    function remove() {
      activeToken = undefined;
      $cookieStore.remove('token');
    }

    /**
     * @public activate
     * Activate the $interval timer to periodically check if the
     * token needs to be refreshed.
     * @param {Boolean} refreshNow whether or not to refresh right away
     * @param {int} delay Interval delay default 1 hour
     */
    function activate(refreshNow, delay) {
      delay = angular.isDefined(delay) ? delay : (1 * 60 * 60 * 1000);
      if (angular.isDefined(refresher)) {
        return;
      }

      logger.log(TAG, 'Starting token refresher');
      refresher = $interval(refreshToken, delay);

      // TO DO - renable refresher
      // if (refreshNow) {
      //   timeout = $timeout(function () {
      //     refreshToken();
      //     timeout = undefined;
      //   }, 60 * 1000);
      // }
    }

    /**
     * @public deactivate
     * Deactivate the $interval timer
     */
    function deactivate() {
      if (angular.isDefined(refresher)) {
        logger.log(TAG, 'Stopping token refresher');
        $interval.cancel(refresher);
        refresher = undefined;
      }
    }

    /**
     * @public destroy
     * Delete the token from storage and stop the timer, effectively
     * logging the user out
     */
    function destroy() {
      if (timeout) {
        $timeout.cancel(timeout);
      }
      deactivate();
      remove();
    }

    /**
     * Private Methods
     */

    /**
     * @private refreshToken
     * Will send a request to server to refresh token, the server
     * either responds with a new token, or the same one.  Either way
     * put that token into storage
     * @return {String} New or old token
     */
    function refreshToken() {
      if (timeout) {
        $timeout.cancel(timeout);
      }
      return $http.get('auth/refresh')
        .then(refreshSuccess)
        .catch(refreshFailed);

      function refreshSuccess(response) {
        store(response.data.token);
        AuthEvent.refresh();
        logger.log(TAG, 'Token was refreshed.');
        return response.data.token;
      }

      function refreshFailed(error) {
        deactivate();
        return $q.reject(error.data.message);
      }
    }
  }
}());
