(function () {
  'use strict';

  /* @ngdoc directive
   * @name ui.gpio.directive:pin
   * @restrict EA
   * @element
   * <div pin-toggle></div>
   * <pin-toggle></pin-toggle>
   * @description
   * Display the toggle button to interact with gpio pin
   *
   * @scope
   * pin { _id, name, input: {}, output: {}}
   */
  angular
    .module('ui.gpio')
    .directive('pinToggle', pinToggleConfig);

  /** @ngInject */
  function pinToggleConfig() {
    var directive = {
      scope: {
        name: '@',
        status: '=',
        error: '=?',
        toggle: '&?',
        upIcon: '@?',
        downIcon: '@?'
      },
      templateUrl: 'app/ui/gpio/pins/toggle/pin-toggle.tpl.html',
      restrict: 'EA',
      replace: false,
      controller: CtrlFunct,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function CtrlFunct(logger) {
      var vm = this;
      vm.upIcon = vm.upIcon || 'fa-arrow-up';
      vm.downIcon = vm.downIcon || 'fa-arrow-down';
      vm.toggle = vm.toggle || defaultToggle;

      function defaultToggle() {
        logger.warning('Not implemented', null, 'Warning');
      }
    }
  }
}());
