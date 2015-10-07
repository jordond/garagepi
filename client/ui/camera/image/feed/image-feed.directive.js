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
  function ImageFeedConfig($q, logger, resizeService) {
    var directive = {
      scope: {
        feedStreaming: '@',
        feedWidth: '@',
        feedHeight: '@',
        feedSrc: '@'
      },
      templateUrl: 'ui/camera/image/feed/image-feed.tpl.html',
      restrict: 'EA',
      replace: false,
      controller: CtrlFunct,
      controllerAs: 'vm'
    };

    return directive;

    /** @ngInject */
    function CtrlFunct($scope) {
      var vm = this;

      vm.width = $scope.feedWidth;
      vm.height = $scope.feedHeight;

      $scope.$watch('feedSrc', function (value) {
        resize(value)
          .then(function (image) {
            vm.frame = image;
          });
      });

      function resize(src) {
        var q = $q.defer();
        vm.width = vm.width || 1280;
        vm.height = vm.height || 720;
        resizeService.resizeImage(src, {
          width: vm.width,
          height: vm.height
        }, function (err, image) {
          if (err) {
            logger.log('ImageFeed', 'No frame data');
            q.reject(err);
          }
          q.resolve(image);
        });
        return q.promise;
      }
    }
  }
}());
