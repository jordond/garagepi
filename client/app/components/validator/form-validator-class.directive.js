(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.directive:formValidatorClass
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('components')
    .directive('formValidatorClass', formValidatorClass);

  function formValidatorClass() {
    return {
      restrict: 'A',
      scope: {
        control: '='
      },
      replace: false,
      link: function (scope, element) {
        scope.$watch('control.$viewValue', function () {
          updateClass();
        });
        scope.$watch('control.$invalid', function () {
          updateClass();
        });
        scope.$watch('control.$pristine', function (pristine) {
          if (pristine) {
            reset();
          }
        });

        function updateClass() {
          if (angular.isDefined(scope.control) && scope.control.$dirty) {
            if (scope.control.$invalid) {
              element.removeClass('has-success').addClass('has-error');
            } else if (scope.control.$valid) {
              element.removeClass('has-error').addClass('has-success');
            } else {
              reset();
            }
          }
        }

        function reset() {
          element.removeClass('has-success has-error');
        }
      }
    };
  }
}());
