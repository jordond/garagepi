(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name json.service:Json
   *
   * @description
   *
   */
  angular
    .module('components')
    .service('JsonService', Json);

  function Json($http, $log, _) {
    var self = this
    , jsonDir = 'json/'
    , jsonFile = 'app.json';

    self.json = {};

    self.get = function () {
      return $http.get(jsonDir + jsonFile)
        .success(function (data) {
          self.json = data;
        })
        .error(function (data, status) {
          $log.error(status + ' ' + data);
        });
    };

    self.find = function (key) {
      return _.chain(self.json)
        .pluck(key)
        .reject(_.isUndefined)
        .first()
        .value();
    };

    self.retrieve = function (key) {
      return _.get(self.json[0], key);
    };
  }
}());
