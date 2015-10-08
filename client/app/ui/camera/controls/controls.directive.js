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
  function CameraControlsConfig(ngDialog, Feed) {
    var directive = {
      restrict: 'EA',
      scope: {},
      templateUrl: 'app/ui/camera/controls/controls.tpl.html',
      replace: false,
      controller: CameraControlsCtrl,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    function CameraControlsCtrl() {
      var vm = this;
      vm.feed = Feed;
      vm.showInfo = showInfo;

      function showInfo() {
        Feed.info()
          .then(function (info) {
            var data = {};
            data.motion = info.config.extra;
            data.config = angular.copy(info.config);
            delete data.config.extra;
            ngDialog.open({
              template: 'app/ui/camera/controls/info/info-modal.tpl.html',
              data: data
            });
          });
      }
    }
  }
}());
