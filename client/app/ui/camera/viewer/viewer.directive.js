(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name ui.camera.directive:cameraView
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('ui.camera')
    .directive('cameraView', ViewerConfig);

  /** @ngInject */
  function ViewerConfig(Feed, logger) {
    var directive = {
      restrict: 'EA',
      scope: {
        autostart: '@'
      },
      templateUrl: 'app/ui/camera/viewer/viewer.tpl.html',
      replace: false,
      link: linkFunct,
      controller: ViewerCtrl,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function ViewerCtrl() {
      var vm = this;

      Feed.init(vm.autostart)
        .then(onActivated)
        .catch(function () {
          logger.warning('Camera feed failed to activate', '', 'Problem Occurred');
          vm.feed = Feed.data;
        });

      function onActivated() {
        logger.log('Viewer', 'Feed services has been activated');
        vm.feed = Feed.data;
      }
    }

    function linkFunct(scope) {
      scope.$on('$destroy', function () {
        logger.log('Viewer', 'onDestroy stopping camera');
        Feed.destroy();
      });
    }
  }
}());
