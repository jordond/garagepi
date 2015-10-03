(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name app.directive:cameraControls
   * @restrict EA
   * @element
   *
   * @description
   *
   */
  angular
    .module('ui.camera')
    .directive('cameraControls', CameraControlsConfig);

  /** @ngInject */
  function CameraControlsConfig(Feed) {
    var directive = {
      restrict: 'EA',
      scope: {},
      templateUrl: 'ui/camera/controls/controls.tpl.html',
      replace: false,
      controller: CameraControlsCtrl,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function CameraControlsCtrl() {
      var vm = this;
      vm.feed = Feed;
      vm.info = info;

      function info() {
        console.log('inside info');
      }
    }
  }
}());
