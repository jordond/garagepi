(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.directive:formValidator
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('components')
    .directive('formValidator', formValidator);

  function formValidator() {
    return {
      restrict: 'EA',
      scope: {
        control: '='
      },
      templateUrl: 'app/components/validator/form-validator.tpl.html',
      replace: false
    };
  }
}());
