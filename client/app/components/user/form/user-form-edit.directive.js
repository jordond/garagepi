(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name home.directive:userFormEdit
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('components')
    .directive('userFormEdit', userFormEdit);

  function userFormEdit() {
    return {
      restrict: 'EA',
      scope: {
        value: '=',
        original: '@',
        unlocked: '='
      },
      templateUrl: 'app/components/user/form/user-form-edit.tpl.html',
      replace: false,
      link: function (scope, element, attrs) {
        var original = angular.copy(scope.original);

        scope.unlocked = !attrs.hasOwnProperty('unlocked');

        scope.clicked = clicked;

        function clicked() {
          scope.unlocked = !scope.unlocked;
          scope.value = original;
        }
      }
    };
  }
}());
