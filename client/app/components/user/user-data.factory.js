(function () {
  'use strict';

  /**
   * @ngdoc factory
   * @name home.factory:UserData
   *
   * @description
   *
   */
  angular
    .module('components')
    .factory('UserData', UserData);

  UserData.$inject = ['$q', 'User', 'logger'];

  function UserData($q, User, logger) {
    var service;

    service = {
      all           : queryAllUsers,
      find          : findUser,
      create        : createUser,
      changePassword: changePassword,
      update        : update,
      remove        : remove
    };

    return service;

    /**
     * Public Methods
     */

    function queryAllUsers() {
      var promise = User.all()
        .$promise
        .then(getAllSuccess)
        .catch(getAllFailed);

      return promise;

      function getAllSuccess(response) {
        return response.data;
      }

      function getAllFailed() {
        return $q.reject(false);
      }
    }

    /**
     * Grab a single user from the database
     * @param  {String} id primary key for user
     * @return {Object}    Found user
     */
    function findUser(id) {
      if (angular.equals(id, '') || angular.isUndefined(id)) {
        logger.warning('No user ID given');
        return $q.when(false);
      }

      return User.get({id: id})
        .$promise
        .then(findSuccess)
        .catch(findFailed);

      function findSuccess(response) {
        return response.data;
      }

      function findFailed(error) {
        if (error.data.message) {
          logger.error(error.data.message, error, 'Something went wrong');
        }
        return $q.reject(error);
      }
    }

    /**
     * Create a new user
     * @param  {object} newUser User to be created
     * @return {promise}        Promise of a better tomorrow
     */
    function createUser(newUser) {
      return User.save(newUser)
        .$promise
        .then(createSuccess)
        .catch(createFailed);

      function createSuccess(response) {
        logger.success(response.message, '', 'User Created');
        return response.data;
      }

      function createFailed(error) {
        return userActionFailed(error);
      }
    }

    /**
     * Change the password of the given user
     * @param  {string} id          ID of the user to be updated
     * @param  {string} oldPassword Current password
     * @param  {string} newPassword Password to change to
     * @return {promise}            Success or failure
     */
    function changePassword(id, oldPassword, newPassword) {
      if (angular.equals(oldPassword, newPassword)) {
        logger.info('Passwords were the same!', '', 'Update Failed');
        return $q.reject(false);
      }

      return User.changePassword({id: id}, {
          oldPassword: oldPassword,
          newPassword: newPassword
        })
        .$promise
        .then(changePasswordSuccess)
        .catch(changePasswordFailed);

      function changePasswordSuccess(response) {
        logger.success(response.message);
        return response;
      }

      function changePasswordFailed(error) {
        return failed(error, 'Couldn\' change password');
      }
    }

    /**
     * Update the user
     * @param  {object} user User object with new user information
     * @return {promise}     Success or failure
     */
    function update(user) {
      return User.update({id: user._id}, user)
        .$promise
        .then(updateSuccess)
        .catch(updateFailed);

      function updateSuccess(response) {
        logger.success(response.message, '', 'Update Succesful');
        return response.data;
      }

      function updateFailed(error) {
        return userActionFailed(error);
      }
    }

    /**
     * Delete a user from the database
     * @param  {Int} id     user id
     * @return {Promise}    status of call
     */
    function remove(id) {
      return User.remove({id: id})
        .$promise
        .then(removeSuccess)
        .catch(removeFailed);

      function removeSuccess(response) {
        return response.message;
      }

      function removeFailed(error) {
        return failed(error, 'User was not deleted');
      }
    }

    /**
     * Private functions
     */

    /**
     * Iterate through all of the error properties and
     * create a warning toast about it
     * @param  {Object} error Error object returned from server
     * @return {Object}       Rejected promise containing error data
     */
    function userActionFailed(error) {
      var errors = []
        , fields = []
        , err;

      if (error.hasOwnProperty('data')) {
        errors = error.data.errors ? error.data.errors : {};
        for (err in errors) {
          if ({}.hasOwnProperty.call(errors, err)) {
            err = errors[err];
            fields.push(err.path);
            logger.warning(err.message, err, error.message);
          }
        }
      } else {
        failed(error, 'Uncaught Exception on update or create');
      }
      return $q.reject(fields);
    }

    /**
     * Reusable rejection function for a failed promise
     * @param  {Object} error   The error object from the $promise
     * @param  {String} message Title for the toast notification
     * @return {String}         Error message
     */
    function failed(error, message) {
      var errMsg = error.hasOwnProperty('data') ? error.data.message : '';
      logger.error(errMsg, error, message);
      return $q.reject(false);
    }
  }
}());
