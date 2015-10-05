(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name app.directive:ImageError
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('ui.camera.image')
    .directive('imgError', ImageErrorConfig);

  /** @ngInject */
  function ImageErrorConfig() {
    var directive = {
      restrict: 'A',
      scope: {
        default: '@',
        error: '='
      },
      replace: false,
      link: linkFunct
    };

    return directive;

    function linkFunct(scope, element) {
      if (!scope.default) {
        scope.default = 'images/ngsrc-default.jpg';
      }

      element.on('error', onError);

      function onError() {
        var src = scope.error;
        if (src === 'data:image/jpeg;base64, ') {
          src = scope.default;
        }
        if (element[0].src !== src) {
          element[0].src = src;
        }
      }
    }
  }
}());
