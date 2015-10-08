(function () {
  'use strict';

  /**
   * @ngdoc factory
   * @name components.service:UserSocket
   *
   * @description
   *
   */
  angular
    .module('components')
    .factory('UserSocket', UserSocket);

  UserSocket.$injector = ['Socket', 'UserData', 'logger'];

  function UserSocket(Socket, UserData, logger) {
    var TAG = 'UserSocket'
      , users
      , isActivated
      , service;

    service = {
      activate: activate,
      deactivate: deactivate
    };

    return service;

    /**
     * Public Methods
     */

    /**
     * @public activate
     * If not already activated, call the user data service to retrieve
     * all of the users.  Once users are returned, then sync the array
     * with the socket service.
     * @return {Array} Initially a promise, resolves to user list
     */
    function activate() {
      if (!isActivated) {
        users = UserData.all()
          .then(success)
          .catch(failed);

        isActivated = true;
      }
      return users;
    }

    /**
     * @public deactivate
     * Unsync the model from the socket service
     */
    function deactivate() {
      Socket.unsyncUpdates('user');
      isActivated = false;
    }

    /**
     * Private Methods
     */

    /**
     * Successfully retrieved all of the users, sync
     * the array to the socket
     * @param  {Array} response list of users
     * @return {Array}          list of users
     */
    function success(response) {
      Socket.syncUpdates('user', response)
        .then(destroy);
      return response;

      // function notify(message) {
      //   console.log(message);
      // }
    }

    function failed() {
      logger.log(TAG, 'Failed to activate');
    }

    /**
     * @private destroy
     * Callback
     * Called when the socket service unsyncs the model.
     */
    function destroy() {
      users = [];
      isActivated = false;
    }
  }
}());
