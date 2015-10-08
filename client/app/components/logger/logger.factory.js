(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name components.factory:Logger
   *
   * @description
   *
   */
  angular
    .module('components')
    .factory('logger', logger);

  logger.$inject = ['$log', '$filter', 'toastr', 'SweetAlert'];

  function logger($log, $filter, toastr, SweetAlert) {
    var service = {
      showToasts: true,

      error    : error,
      info     : info,
      success  : success,
      warning  : warning,

      swalError: alertError,

      log      : log
    };

    return service;

    /**
     * Public Methods
     */

    function error(message, data, title) {
      toastr.error(message, title);
      $log.error(getTimestamp() + '[Error] ' + message, data);
    }

    function info(message, data, title) {
      toastr.info(message, title);
      $log.info(getTimestamp() + '[Info] ' + message, data);
    }

    function success(message, data, title) {
      toastr.success(message, title);
      $log.info(getTimestamp() + '[Success] ' + message, data);
    }

    function warning(message, data, title) {
      toastr.warning(message, title);
      $log.warn(getTimestamp() + '[Warning] ' + message, data);
    }

    function log(tag, message) {
      $log.log(getTimestamp() + '[' + tag + '] ' + message);
    }

    /**
     * Eventurally remove, and replace with factory, that way
     * only one dialog can be open at one time.
     * @param  {String} tag     caller
     * @param  {String} message desctiption of error
     */
    function alertError(tag, message) {
      SweetAlert.error({
        title: '[' + tag + ']' + ' - Error',
        text: message
      });
      log(tag, message);
    }

    /**
     * Private Methods
     */

    function getTimestamp() {
      return '[' + $filter('date')(new Date(), 'yyyy/dd/MM HH:mm:ss') + ']';
    }
  }
}());
