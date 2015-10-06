(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name app.ui.common.directive:booleanCheck
   * @restrict EA
   * @element
   *
   * @description
   * Display a checkmark or an x
   */
  angular
    .module('ui.common')
    .directive('booleanCheck', DirectiveConfig);

  function DirectiveConfig() {
    var directive = {
      restrict: 'EA',
      scope: {
        checked: '@'
      },
      replace: false,
      template: '<div class="boolean-check">' +
                 '<i class="fa" ng-class="checked ? \'fa-check\' : \'fa-times\'"></i>' +
                '</div>'
    };

    return directive;
  }
}());
