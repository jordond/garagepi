(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name components.directive:addClassOnScroll
   * @restrict A
   * @element
   *
   * @description
   *
   */
  angular
    .module('components')
    .directive('addClassOnScroll', addClassOnScroll);

  /** @ngInject */
  function addClassOnScroll($window) {
    var $win = angular.element($window);
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        /*jshint undef:false */
        /*eslint-disable*/
        var topClass = attrs.addClassOnScroll
        , offsetTop = $(element).offset().top;

        $win.on('scroll', function () {
          if ($($win).scrollTop() >= offsetTop) {
            element.addClass(topClass);
          } else {
            element.removeClass(topClass);
          }
        });
        /*jshint undef:true */
        /*eslint-enable*/
      }
    };
  }
}());
