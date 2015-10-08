(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name ui.camera.image.directive:feedStatus
   * @restrict EA
   * @element
   *
   * @description
   * Display a loading spinner
   *
   */
  angular
    .module('ui.camera.image')
    .directive('feedStatus', FeedStatusConfig);

  function FeedStatusConfig() {
    var directive = {
      restrict: 'EA',
      scope: {
        streaming: '=',
        loading: '=',
        motion: '=',
        error: '='
      },
      templateUrl: 'app/ui/camera/image/status/feed-status.tpl.html',
      replace: false,
      link: linkFunct
    };

    return directive;

    function linkFunct(scope, element) {
      element.addClass(('status-container'));
    }
  }
}());
