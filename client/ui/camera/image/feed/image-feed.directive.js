(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name app.directive:imageFeed
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('ui.camera.image')
    .directive('imageFeed', ImageFeedConfig);

  /** @ngInject */
  function ImageFeedConfig(resizeService) {
    var directive = {
      restrict: 'EA',
      replace: false,
      link: linkFunct
    };

    return directive;

    function linkFunct(scope, element, attrs) {
      attrs.$observe('feedSrc', onObserve);

      function onObserve(data) {
        resizeService.resizeImage(data, {
          width: 1280
        }, function (err, image) {
          if (err) {
            return console.log('error: ', err);
          }

          attrs.$set('src', image);
        });
        // var background = 'url(' + image + ') no-repeat center';
        // element.css({
        //   height : attrs.feedHeight,
        //   background: background,
        //   'background-size' : 'cover'
        // });
      }
    }
  }
}());
