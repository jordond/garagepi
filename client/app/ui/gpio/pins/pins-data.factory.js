(function () {
  'use strict';

  /* @ngdoc factory
   * @name ui.gpio.factory:pinData
   *
   * @description
   * Handle all requests to backend for gpio data
   *
   */
  angular
    .module('ui.gpio')
    .factory('pinData', pinDataConfig);

  /** @ngInject */
  function pinDataConfig($q, $http, logger, Socket) {
    var service
      , pins
      , apiBase = '/api/gpios/';

    service = {
      activate: activate,
      all: queryAll,
      toggle: togglePin,
      deactivate: deactivate
    };

    return service;

    /**
     * Public Methods
     */

    function activate() {
      pins = queryAll()
        .then(success);
      return pins;

      function success(data) {
        Socket.syncUpdates('gpio', data)
          .then(destroy, null, notify);
        return data;
      }

      function destroy() {
        pins = [];
      }

      function notify() {
        logger.log('PinsData', 'Receieved notify from promise');
      }
    }

    /**
     * Grab all the pins from the server
     * @return {Array} list of all pins
     */
    function queryAll() {
      return $http.get(apiBase)
        .then(success)
        .catch(failed);

      function success(response) {
        logger.log('PinsData', 'Retrieved all pins');
        return response.data;
      }

      function failed(error) {
        logger.error('Failed to get pins from server', error, 'Whoops');
        return error;
      }
    }

    /**
     * Toggle an output pin
     * pin: _id, name, output {}, input {}
     * @param {Object} pin contains pin info
     * @return {Boolean} toggle status
     */
    function togglePin(pin) {
      return $http.get(apiBase + pin.id)
        .then(success)
        .catch(failed);

      function success(response) {
        logger.log('PinsData', 'Pin [' + pin.name + '] toggled' + response);
        return response;
      }

      function failed(error) {
        logger.error('Toggling of Pin [' + pin.name + '] failed', error, 'Whoops');
        return error;
      }
    }

    /**
     * Unsync the model from the socket factory
     */
    function deactivate() {
      Socket.unsyncUpdates('gpio');
    }
  }
}());
