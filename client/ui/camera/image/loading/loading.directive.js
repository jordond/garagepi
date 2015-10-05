(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name ui.camera.image.directive:feedLoading
   * @restrict EA
   * @element
   *
   * @description
   * Display a loading spinner
   *
   */
  angular
    .module('ui.camera.image')
    .directive('feedLoading', FeedLoadingConfig);

  function FeedLoadingConfig() {
    var directive = {
      restrict: 'EA',
      scope: {
        loading: '='
      },
      replace: false,
      link: linkFunct,
      template: '<div class="loading" ng-show="loading">'
               +  '<span class="loading-spinner">'
               +    '<i class="fa fa-3x fa-spinner fa-spin"></i>'
               +  '</span>'
               +  '<span class="loading-text">'
               +    'Loading'
               +  '</span>'
               + '</div>'
    };

    return directive;

    function linkFunct(scope, element) {
      element.addClass(('loading-container'));
    }
  }
}());
