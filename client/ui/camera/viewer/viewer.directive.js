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
      templateUrl: 'ui/camera/viewer/viewer.tpl.html',
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

      Feed.activate(vm.autostart)
        .then(onActivated);

      function onActivated() {
        logger.log('Viewer', 'Feed services has been activated');
        vm.feed = Feed;
      }

      vm.fnPlay = play;
      vm.fnStop = stop;
      vm.fnInfo = info;

      function play() {
        console.log('Inside play');
      }

      function stop() {
        console.log('Inside stop');
      }

      function info() {
        console.log('Inside info');
      }
    }

    function linkFunct(scope, element, attrs) {
      /*jshint unused:false */
      /*eslint "no-unused-vars": [2, {"args": "none"}]*/
    }
  }
}());
