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
  function CameraControlsConfig() {
    var directive = {
      restrict: 'EA',
      scope: {
        play: '&',
        stop: '&',
        reset: '&',
        info: '&'
      },
      templateUrl: 'ui/camera/controls/controls.tpl.html',
      replace: false,
      link: linkFunct,
      controller: CameraControlsCtrl,
      controllerAs: 'vm'
    };

    return directive;

    /** @ngInject */
    function CameraControlsCtrl() {
      var vm = this;
      vm.name = '';
    }

    function linkFunct(scope, element, attrs) {
      /*jshint unused:false */
      /*eslint "no-unused-vars": [2, {"args": "none"}]*/
    }
  }
}());
