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

  Token.$inject = ['$cookieStore', '$q', '$interval', '$http', 'logger'];

  function Token($cookieStore, $q, $interval, $http, logger) {
    var TAG = 'Token'
      , self = this
      , activeToken
      , refresher;

    /**
     * Public Members
     */

    self.init       = init;
    self.get        = get;
    self.has        = has;
    self.refresh    = refresh;
    self.store      = store;
    self.remove     = remove;
    self.activate   = activate;
    self.deactivate = deactivate;
    self.destroy    = destroy;

    /**
     * Public Methods
     */

    /**
     * @public init
     * Initialize this token service, grab the current token
     * and then activate $interval timer
     * @return {Promise} Containing the active token
     */
    function init() {
      activeToken = $cookieStore.get('token');
      return $q.when(activeToken);
    }

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
     * @param {int} delay Interval delay default 1 hour
     */
    function activate(delay) {
      delay = angular.isDefined(delay) ? delay : (1 * 60 * 60 * 1000);
      if (angular.isDefined(refresher)) {
        return;
      }

      logger.log(TAG, 'Starting token refresher');
      refresher = $interval(runner, delay);
      refreshToken();

      function runner() {
        logger.log(TAG, 'Refreshing token');
        refreshToken();
      }
    }

    /**
     * @public deactivate
     * Deactivate the $interval timer
     */
    function deactivate() {
      if (angular.isDefined(refresher)) {
        logger.log(TAG, 'Stoping token refresher');
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
      remove();
      deactivate();
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
      return $http.get('auth/refresh')
        .then(refreshSuccess)
        .catch(refreshFailed);

      function refreshSuccess(response) {
        store(response.data.token);
        return response.data.token;
      }

      function refreshFailed(error) {
        deactivate();
        return $q.reject(error.data.message);
      }
    }
  }
}());
