(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.directive:passwordCompare
   * @restrict EA
   * @element
   *
   * @description
   *
   *
   */
  angular
    .module('components')
    .directive('passwordCompare', passwordCompare);

  function passwordCompare() {
    return {
      restrict: 'A',
      scope: {
        compare: '='
      },
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        ngModel.$validators.comparePassword = function (modelValue) {
          return modelValue === scope.compare;
        };

        scope.$watch('compare', function () {
          ngModel.$validate();
        });
      }
    };
  }
}());
