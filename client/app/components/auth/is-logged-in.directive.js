(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.auth.directive:isLoggedIn
   * @restrict A
   * @element
   *
   * @description
   *
   */
  angular
    .module('components')
    .directive('isLoggedIn', isLoggedIn);

  /** @ngInject */
  function isLoggedIn(Auth) {
    return {
      restrict: 'A',
      link: function ($scope) {
        $scope.loggedIn = Auth.isLoggedIn();

        $scope.$on('stateChanged', function () {
          Auth.isLoggedInAsync()
            .then(function (loggedIn) {
              $scope.loggedIn = loggedIn;
            });
        });
      }
    };
  }
}());
