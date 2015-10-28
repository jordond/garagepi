(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.directive:getCurrentState
   * @restrict A
   * @element
   *
   * @description
   *
   */
  angular
    .module('components')
    .directive('getCurrentState', getCurrentState);

  /** @ngInject */
  function getCurrentState($location, Auth) {
    return {
      restrict: 'A',
      link: function ($scope) {
        var initialState = $location.url();

        $scope.currentState = initialState.replace('/', '');

        Auth.isLoggedInAsync(function (loggedIn) {
          if (!loggedIn) {
            $scope.currentState = 'login';
          }
        });

        $scope.$on('stateChanged', function (event, stateName) {
          $scope.currentState = stateName;
        });
      }
    };
  }
}());
